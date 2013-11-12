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
  _$jscoverage['/base.js'].lineData[8] = 0;
  _$jscoverage['/base.js'].lineData[9] = 0;
  _$jscoverage['/base.js'].lineData[11] = 0;
  _$jscoverage['/base.js'].lineData[17] = 0;
  _$jscoverage['/base.js'].lineData[18] = 0;
  _$jscoverage['/base.js'].lineData[21] = 0;
  _$jscoverage['/base.js'].lineData[22] = 0;
  _$jscoverage['/base.js'].lineData[25] = 0;
  _$jscoverage['/base.js'].lineData[26] = 0;
  _$jscoverage['/base.js'].lineData[27] = 0;
  _$jscoverage['/base.js'].lineData[28] = 0;
  _$jscoverage['/base.js'].lineData[29] = 0;
  _$jscoverage['/base.js'].lineData[30] = 0;
  _$jscoverage['/base.js'].lineData[32] = 0;
  _$jscoverage['/base.js'].lineData[35] = 0;
  _$jscoverage['/base.js'].lineData[36] = 0;
  _$jscoverage['/base.js'].lineData[37] = 0;
  _$jscoverage['/base.js'].lineData[39] = 0;
  _$jscoverage['/base.js'].lineData[40] = 0;
  _$jscoverage['/base.js'].lineData[41] = 0;
  _$jscoverage['/base.js'].lineData[43] = 0;
  _$jscoverage['/base.js'].lineData[59] = 0;
  _$jscoverage['/base.js'].lineData[60] = 0;
  _$jscoverage['/base.js'].lineData[62] = 0;
  _$jscoverage['/base.js'].lineData[63] = 0;
  _$jscoverage['/base.js'].lineData[64] = 0;
  _$jscoverage['/base.js'].lineData[66] = 0;
  _$jscoverage['/base.js'].lineData[68] = 0;
  _$jscoverage['/base.js'].lineData[69] = 0;
  _$jscoverage['/base.js'].lineData[70] = 0;
  _$jscoverage['/base.js'].lineData[73] = 0;
  _$jscoverage['/base.js'].lineData[75] = 0;
  _$jscoverage['/base.js'].lineData[76] = 0;
  _$jscoverage['/base.js'].lineData[77] = 0;
  _$jscoverage['/base.js'].lineData[80] = 0;
  _$jscoverage['/base.js'].lineData[82] = 0;
  _$jscoverage['/base.js'].lineData[83] = 0;
  _$jscoverage['/base.js'].lineData[85] = 0;
  _$jscoverage['/base.js'].lineData[87] = 0;
  _$jscoverage['/base.js'].lineData[90] = 0;
  _$jscoverage['/base.js'].lineData[92] = 0;
  _$jscoverage['/base.js'].lineData[100] = 0;
  _$jscoverage['/base.js'].lineData[104] = 0;
  _$jscoverage['/base.js'].lineData[105] = 0;
  _$jscoverage['/base.js'].lineData[106] = 0;
  _$jscoverage['/base.js'].lineData[107] = 0;
  _$jscoverage['/base.js'].lineData[109] = 0;
  _$jscoverage['/base.js'].lineData[110] = 0;
  _$jscoverage['/base.js'].lineData[111] = 0;
  _$jscoverage['/base.js'].lineData[113] = 0;
  _$jscoverage['/base.js'].lineData[116] = 0;
  _$jscoverage['/base.js'].lineData[117] = 0;
  _$jscoverage['/base.js'].lineData[119] = 0;
  _$jscoverage['/base.js'].lineData[121] = 0;
  _$jscoverage['/base.js'].lineData[122] = 0;
  _$jscoverage['/base.js'].lineData[124] = 0;
  _$jscoverage['/base.js'].lineData[127] = 0;
  _$jscoverage['/base.js'].lineData[135] = 0;
  _$jscoverage['/base.js'].lineData[139] = 0;
  _$jscoverage['/base.js'].lineData[140] = 0;
  _$jscoverage['/base.js'].lineData[141] = 0;
  _$jscoverage['/base.js'].lineData[143] = 0;
  _$jscoverage['/base.js'].lineData[153] = 0;
  _$jscoverage['/base.js'].lineData[159] = 0;
  _$jscoverage['/base.js'].lineData[160] = 0;
  _$jscoverage['/base.js'].lineData[161] = 0;
  _$jscoverage['/base.js'].lineData[164] = 0;
  _$jscoverage['/base.js'].lineData[167] = 0;
  _$jscoverage['/base.js'].lineData[168] = 0;
  _$jscoverage['/base.js'].lineData[169] = 0;
  _$jscoverage['/base.js'].lineData[170] = 0;
  _$jscoverage['/base.js'].lineData[171] = 0;
  _$jscoverage['/base.js'].lineData[173] = 0;
  _$jscoverage['/base.js'].lineData[175] = 0;
  _$jscoverage['/base.js'].lineData[180] = 0;
  _$jscoverage['/base.js'].lineData[193] = 0;
  _$jscoverage['/base.js'].lineData[194] = 0;
  _$jscoverage['/base.js'].lineData[195] = 0;
  _$jscoverage['/base.js'].lineData[198] = 0;
  _$jscoverage['/base.js'].lineData[199] = 0;
  _$jscoverage['/base.js'].lineData[201] = 0;
  _$jscoverage['/base.js'].lineData[202] = 0;
  _$jscoverage['/base.js'].lineData[212] = 0;
  _$jscoverage['/base.js'].lineData[216] = 0;
  _$jscoverage['/base.js'].lineData[217] = 0;
  _$jscoverage['/base.js'].lineData[218] = 0;
  _$jscoverage['/base.js'].lineData[219] = 0;
  _$jscoverage['/base.js'].lineData[221] = 0;
  _$jscoverage['/base.js'].lineData[222] = 0;
  _$jscoverage['/base.js'].lineData[223] = 0;
  _$jscoverage['/base.js'].lineData[224] = 0;
  _$jscoverage['/base.js'].lineData[227] = 0;
  _$jscoverage['/base.js'].lineData[228] = 0;
  _$jscoverage['/base.js'].lineData[229] = 0;
  _$jscoverage['/base.js'].lineData[234] = 0;
  _$jscoverage['/base.js'].lineData[235] = 0;
  _$jscoverage['/base.js'].lineData[239] = 0;
  _$jscoverage['/base.js'].lineData[240] = 0;
  _$jscoverage['/base.js'].lineData[249] = 0;
  _$jscoverage['/base.js'].lineData[250] = 0;
  _$jscoverage['/base.js'].lineData[252] = 0;
  _$jscoverage['/base.js'].lineData[253] = 0;
  _$jscoverage['/base.js'].lineData[254] = 0;
  _$jscoverage['/base.js'].lineData[255] = 0;
  _$jscoverage['/base.js'].lineData[257] = 0;
  _$jscoverage['/base.js'].lineData[259] = 0;
  _$jscoverage['/base.js'].lineData[265] = 0;
  _$jscoverage['/base.js'].lineData[266] = 0;
  _$jscoverage['/base.js'].lineData[267] = 0;
  _$jscoverage['/base.js'].lineData[268] = 0;
  _$jscoverage['/base.js'].lineData[269] = 0;
  _$jscoverage['/base.js'].lineData[270] = 0;
  _$jscoverage['/base.js'].lineData[271] = 0;
  _$jscoverage['/base.js'].lineData[276] = 0;
  _$jscoverage['/base.js'].lineData[348] = 0;
  _$jscoverage['/base.js'].lineData[351] = 0;
  _$jscoverage['/base.js'].lineData[352] = 0;
  _$jscoverage['/base.js'].lineData[353] = 0;
  _$jscoverage['/base.js'].lineData[355] = 0;
  _$jscoverage['/base.js'].lineData[357] = 0;
  _$jscoverage['/base.js'].lineData[358] = 0;
  _$jscoverage['/base.js'].lineData[359] = 0;
  _$jscoverage['/base.js'].lineData[360] = 0;
  _$jscoverage['/base.js'].lineData[361] = 0;
  _$jscoverage['/base.js'].lineData[365] = 0;
  _$jscoverage['/base.js'].lineData[366] = 0;
  _$jscoverage['/base.js'].lineData[369] = 0;
  _$jscoverage['/base.js'].lineData[370] = 0;
  _$jscoverage['/base.js'].lineData[374] = 0;
  _$jscoverage['/base.js'].lineData[376] = 0;
  _$jscoverage['/base.js'].lineData[377] = 0;
  _$jscoverage['/base.js'].lineData[378] = 0;
  _$jscoverage['/base.js'].lineData[380] = 0;
  _$jscoverage['/base.js'].lineData[381] = 0;
  _$jscoverage['/base.js'].lineData[382] = 0;
  _$jscoverage['/base.js'].lineData[384] = 0;
  _$jscoverage['/base.js'].lineData[385] = 0;
  _$jscoverage['/base.js'].lineData[386] = 0;
  _$jscoverage['/base.js'].lineData[388] = 0;
  _$jscoverage['/base.js'].lineData[389] = 0;
  _$jscoverage['/base.js'].lineData[391] = 0;
  _$jscoverage['/base.js'].lineData[393] = 0;
  _$jscoverage['/base.js'].lineData[395] = 0;
  _$jscoverage['/base.js'].lineData[396] = 0;
  _$jscoverage['/base.js'].lineData[400] = 0;
  _$jscoverage['/base.js'].lineData[401] = 0;
  _$jscoverage['/base.js'].lineData[411] = 0;
  _$jscoverage['/base.js'].lineData[412] = 0;
  _$jscoverage['/base.js'].lineData[413] = 0;
  _$jscoverage['/base.js'].lineData[416] = 0;
  _$jscoverage['/base.js'].lineData[418] = 0;
  _$jscoverage['/base.js'].lineData[420] = 0;
  _$jscoverage['/base.js'].lineData[421] = 0;
  _$jscoverage['/base.js'].lineData[426] = 0;
  _$jscoverage['/base.js'].lineData[427] = 0;
  _$jscoverage['/base.js'].lineData[428] = 0;
  _$jscoverage['/base.js'].lineData[430] = 0;
  _$jscoverage['/base.js'].lineData[431] = 0;
  _$jscoverage['/base.js'].lineData[432] = 0;
  _$jscoverage['/base.js'].lineData[436] = 0;
  _$jscoverage['/base.js'].lineData[437] = 0;
  _$jscoverage['/base.js'].lineData[438] = 0;
  _$jscoverage['/base.js'].lineData[439] = 0;
  _$jscoverage['/base.js'].lineData[466] = 0;
  _$jscoverage['/base.js'].lineData[467] = 0;
  _$jscoverage['/base.js'].lineData[470] = 0;
  _$jscoverage['/base.js'].lineData[471] = 0;
  _$jscoverage['/base.js'].lineData[472] = 0;
  _$jscoverage['/base.js'].lineData[476] = 0;
  _$jscoverage['/base.js'].lineData[477] = 0;
  _$jscoverage['/base.js'].lineData[478] = 0;
  _$jscoverage['/base.js'].lineData[486] = 0;
  _$jscoverage['/base.js'].lineData[491] = 0;
  _$jscoverage['/base.js'].lineData[492] = 0;
  _$jscoverage['/base.js'].lineData[493] = 0;
  _$jscoverage['/base.js'].lineData[495] = 0;
  _$jscoverage['/base.js'].lineData[500] = 0;
  _$jscoverage['/base.js'].lineData[501] = 0;
  _$jscoverage['/base.js'].lineData[502] = 0;
  _$jscoverage['/base.js'].lineData[503] = 0;
  _$jscoverage['/base.js'].lineData[504] = 0;
  _$jscoverage['/base.js'].lineData[509] = 0;
  _$jscoverage['/base.js'].lineData[510] = 0;
  _$jscoverage['/base.js'].lineData[511] = 0;
  _$jscoverage['/base.js'].lineData[515] = 0;
  _$jscoverage['/base.js'].lineData[516] = 0;
  _$jscoverage['/base.js'].lineData[517] = 0;
  _$jscoverage['/base.js'].lineData[518] = 0;
  _$jscoverage['/base.js'].lineData[519] = 0;
  _$jscoverage['/base.js'].lineData[523] = 0;
  _$jscoverage['/base.js'].lineData[524] = 0;
  _$jscoverage['/base.js'].lineData[525] = 0;
  _$jscoverage['/base.js'].lineData[528] = 0;
  _$jscoverage['/base.js'].lineData[529] = 0;
  _$jscoverage['/base.js'].lineData[530] = 0;
  _$jscoverage['/base.js'].lineData[531] = 0;
  _$jscoverage['/base.js'].lineData[532] = 0;
  _$jscoverage['/base.js'].lineData[533] = 0;
  _$jscoverage['/base.js'].lineData[534] = 0;
  _$jscoverage['/base.js'].lineData[535] = 0;
  _$jscoverage['/base.js'].lineData[536] = 0;
  _$jscoverage['/base.js'].lineData[537] = 0;
  _$jscoverage['/base.js'].lineData[538] = 0;
  _$jscoverage['/base.js'].lineData[539] = 0;
  _$jscoverage['/base.js'].lineData[540] = 0;
  _$jscoverage['/base.js'].lineData[541] = 0;
  _$jscoverage['/base.js'].lineData[543] = 0;
  _$jscoverage['/base.js'].lineData[544] = 0;
  _$jscoverage['/base.js'].lineData[546] = 0;
  _$jscoverage['/base.js'].lineData[547] = 0;
  _$jscoverage['/base.js'].lineData[552] = 0;
  _$jscoverage['/base.js'].lineData[553] = 0;
  _$jscoverage['/base.js'].lineData[556] = 0;
  _$jscoverage['/base.js'].lineData[557] = 0;
  _$jscoverage['/base.js'].lineData[558] = 0;
  _$jscoverage['/base.js'].lineData[563] = 0;
  _$jscoverage['/base.js'].lineData[564] = 0;
  _$jscoverage['/base.js'].lineData[565] = 0;
  _$jscoverage['/base.js'].lineData[566] = 0;
  _$jscoverage['/base.js'].lineData[567] = 0;
  _$jscoverage['/base.js'].lineData[572] = 0;
  _$jscoverage['/base.js'].lineData[573] = 0;
  _$jscoverage['/base.js'].lineData[579] = 0;
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
  _$jscoverage['/base.js'].functionData[22] = 0;
  _$jscoverage['/base.js'].functionData[23] = 0;
  _$jscoverage['/base.js'].functionData[24] = 0;
  _$jscoverage['/base.js'].functionData[25] = 0;
  _$jscoverage['/base.js'].functionData[26] = 0;
  _$jscoverage['/base.js'].functionData[27] = 0;
  _$jscoverage['/base.js'].functionData[28] = 0;
  _$jscoverage['/base.js'].functionData[29] = 0;
  _$jscoverage['/base.js'].functionData[30] = 0;
  _$jscoverage['/base.js'].functionData[31] = 0;
}
if (! _$jscoverage['/base.js'].branchData) {
  _$jscoverage['/base.js'].branchData = {};
  _$jscoverage['/base.js'].branchData['29'] = [];
  _$jscoverage['/base.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['35'] = [];
  _$jscoverage['/base.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['36'] = [];
  _$jscoverage['/base.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['40'] = [];
  _$jscoverage['/base.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['104'] = [];
  _$jscoverage['/base.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['104'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['110'] = [];
  _$jscoverage['/base.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['117'] = [];
  _$jscoverage['/base.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['122'] = [];
  _$jscoverage['/base.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['127'] = [];
  _$jscoverage['/base.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['141'] = [];
  _$jscoverage['/base.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['161'] = [];
  _$jscoverage['/base.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['167'] = [];
  _$jscoverage['/base.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['168'] = [];
  _$jscoverage['/base.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['170'] = [];
  _$jscoverage['/base.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['175'] = [];
  _$jscoverage['/base.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['178'] = [];
  _$jscoverage['/base.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['178'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['179'] = [];
  _$jscoverage['/base.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['194'] = [];
  _$jscoverage['/base.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['198'] = [];
  _$jscoverage['/base.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['214'] = [];
  _$jscoverage['/base.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['218'] = [];
  _$jscoverage['/base.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['219'] = [];
  _$jscoverage['/base.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['221'] = [];
  _$jscoverage['/base.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['221'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['222'] = [];
  _$jscoverage['/base.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['227'] = [];
  _$jscoverage['/base.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['234'] = [];
  _$jscoverage['/base.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['252'] = [];
  _$jscoverage['/base.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['252'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['253'] = [];
  _$jscoverage['/base.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['266'] = [];
  _$jscoverage['/base.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['351'] = [];
  _$jscoverage['/base.js'].branchData['351'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['357'] = [];
  _$jscoverage['/base.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['358'] = [];
  _$jscoverage['/base.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['360'] = [];
  _$jscoverage['/base.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['365'] = [];
  _$jscoverage['/base.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['377'] = [];
  _$jscoverage['/base.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['381'] = [];
  _$jscoverage['/base.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['384'] = [];
  _$jscoverage['/base.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['385'] = [];
  _$jscoverage['/base.js'].branchData['385'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['385'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['388'] = [];
  _$jscoverage['/base.js'].branchData['388'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['395'] = [];
  _$jscoverage['/base.js'].branchData['395'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['401'] = [];
  _$jscoverage['/base.js'].branchData['401'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['412'] = [];
  _$jscoverage['/base.js'].branchData['412'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['420'] = [];
  _$jscoverage['/base.js'].branchData['420'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['430'] = [];
  _$jscoverage['/base.js'].branchData['430'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['438'] = [];
  _$jscoverage['/base.js'].branchData['438'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['470'] = [];
  _$jscoverage['/base.js'].branchData['470'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['477'] = [];
  _$jscoverage['/base.js'].branchData['477'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['492'] = [];
  _$jscoverage['/base.js'].branchData['492'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['503'] = [];
  _$jscoverage['/base.js'].branchData['503'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['517'] = [];
  _$jscoverage['/base.js'].branchData['517'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['519'] = [];
  _$jscoverage['/base.js'].branchData['519'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['524'] = [];
  _$jscoverage['/base.js'].branchData['524'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['529'] = [];
  _$jscoverage['/base.js'].branchData['529'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['531'] = [];
  _$jscoverage['/base.js'].branchData['531'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['540'] = [];
  _$jscoverage['/base.js'].branchData['540'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['543'] = [];
  _$jscoverage['/base.js'].branchData['543'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['556'] = [];
  _$jscoverage['/base.js'].branchData['556'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['557'] = [];
  _$jscoverage['/base.js'].branchData['557'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['558'] = [];
  _$jscoverage['/base.js'].branchData['558'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['565'] = [];
  _$jscoverage['/base.js'].branchData['565'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['565'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['566'] = [];
  _$jscoverage['/base.js'].branchData['566'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['567'] = [];
  _$jscoverage['/base.js'].branchData['567'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['572'] = [];
  _$jscoverage['/base.js'].branchData['572'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['573'] = [];
  _$jscoverage['/base.js'].branchData['573'][1] = new BranchData();
}
_$jscoverage['/base.js'].branchData['573'][1].init(36, 10, 'args || []');
function visit126_573_1(result) {
  _$jscoverage['/base.js'].branchData['573'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['572'][1].init(214, 2, 'fn');
function visit125_572_1(result) {
  _$jscoverage['/base.js'].branchData['572'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['567'][1].init(26, 166, 'extensions[i] && (!method ? extensions[i] : extensions[i].prototype[method])');
function visit124_567_1(result) {
  _$jscoverage['/base.js'].branchData['567'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['566'][1].init(29, 7, 'i < len');
function visit123_566_1(result) {
  _$jscoverage['/base.js'].branchData['566'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['565'][2].init(36, 31, 'extensions && extensions.length');
function visit122_565_2(result) {
  _$jscoverage['/base.js'].branchData['565'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['565'][1].init(30, 37, 'len = extensions && extensions.length');
function visit121_565_1(result) {
  _$jscoverage['/base.js'].branchData['565'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['558'][1].init(17, 46, 'plugins[i][method] && plugins[i][method](self)');
function visit120_558_1(result) {
  _$jscoverage['/base.js'].branchData['558'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['557'][1].init(29, 7, 'i < len');
function visit119_557_1(result) {
  _$jscoverage['/base.js'].branchData['557'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['556'][1].init(98, 20, 'len = plugins.length');
function visit118_556_1(result) {
  _$jscoverage['/base.js'].branchData['556'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['543'][1].init(554, 7, 'wrapped');
function visit117_543_1(result) {
  _$jscoverage['/base.js'].branchData['543'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['540'][1].init(467, 13, 'v.__wrapped__');
function visit116_540_1(result) {
  _$jscoverage['/base.js'].branchData['540'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['531'][1].init(54, 11, 'v.__owner__');
function visit115_531_1(result) {
  _$jscoverage['/base.js'].branchData['531'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['529'][1].init(17, 22, 'typeof v == \'function\'');
function visit114_529_1(result) {
  _$jscoverage['/base.js'].branchData['529'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['524'][1].init(17, 7, 'p in px');
function visit113_524_1(result) {
  _$jscoverage['/base.js'].branchData['524'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['519'][1].init(25, 13, 'px[p] || noop');
function visit112_519_1(result) {
  _$jscoverage['/base.js'].branchData['519'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['517'][1].init(63, 17, 'extensions.length');
function visit111_517_1(result) {
  _$jscoverage['/base.js'].branchData['517'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['503'][1].init(17, 28, 'typeof plugin === \'function\'');
function visit110_503_1(result) {
  _$jscoverage['/base.js'].branchData['503'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['492'][1].init(13, 6, 'config');
function visit109_492_1(result) {
  _$jscoverage['/base.js'].branchData['492'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['477'][1].init(13, 5, 'attrs');
function visit108_477_1(result) {
  _$jscoverage['/base.js'].branchData['477'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['470'][1].init(85, 16, 'e.target == self');
function visit107_470_1(result) {
  _$jscoverage['/base.js'].branchData['470'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['438'][1].init(70, 24, 'SubClass.__hooks__ || {}');
function visit106_438_1(result) {
  _$jscoverage['/base.js'].branchData['438'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['430'][1].init(3517, 25, 'SubClass.extend || extend');
function visit105_430_1(result) {
  _$jscoverage['/base.js'].branchData['430'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['420'][1].init(94, 21, 'exp.hasOwnProperty(p)');
function visit104_420_1(result) {
  _$jscoverage['/base.js'].branchData['420'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['412'][1].init(52, 17, 'attrs[name] || {}');
function visit103_412_1(result) {
  _$jscoverage['/base.js'].branchData['412'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['401'][1].init(25, 3, 'ext');
function visit102_401_1(result) {
  _$jscoverage['/base.js'].branchData['401'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['395'][1].init(1972, 17, 'extensions.length');
function visit101_395_1(result) {
  _$jscoverage['/base.js'].branchData['395'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['388'][1].init(1722, 16, 'inheritedStatics');
function visit100_388_1(result) {
  _$jscoverage['/base.js'].branchData['388'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['385'][2].init(1580, 43, 'inheritedStatics !== sx[\'inheritedStatics\']');
function visit99_385_2(result) {
  _$jscoverage['/base.js'].branchData['385'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['385'][1].init(1554, 69, 'sx[\'inheritedStatics\'] && inheritedStatics !== sx[\'inheritedStatics\']');
function visit98_385_1(result) {
  _$jscoverage['/base.js'].branchData['385'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['384'][1].init(1484, 52, 'sp[\'__inheritedStatics__\'] || sx[\'inheritedStatics\']');
function visit97_384_1(result) {
  _$jscoverage['/base.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['381'][1].init(1316, 18, 'sx.__hooks__ || {}');
function visit96_381_1(result) {
  _$jscoverage['/base.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['377'][1].init(1138, 5, 'hooks');
function visit95_377_1(result) {
  _$jscoverage['/base.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['365'][1].init(150, 9, '\'@DEBUG@\'');
function visit94_365_1(result) {
  _$jscoverage['/base.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['360'][1].init(393, 32, 'px.hasOwnProperty(\'constructor\')');
function visit93_360_1(result) {
  _$jscoverage['/base.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['358'][1].init(321, 24, 'sx.name || \'BaseDerived\'');
function visit92_358_1(result) {
  _$jscoverage['/base.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['357'][1].init(292, 8, 'sx || {}');
function visit91_357_1(result) {
  _$jscoverage['/base.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['351'][1].init(100, 22, '!S.isArray(extensions)');
function visit90_351_1(result) {
  _$jscoverage['/base.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['266'][1].init(46, 22, '!self.get(\'destroyed\')');
function visit89_266_1(result) {
  _$jscoverage['/base.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['253'][1].init(141, 14, 'pluginId == id');
function visit88_253_1(result) {
  _$jscoverage['/base.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['252'][2].init(79, 26, 'p.get && p.get(\'pluginId\')');
function visit87_252_2(result) {
  _$jscoverage['/base.js'].branchData['252'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['252'][1].init(79, 40, 'p.get && p.get(\'pluginId\') || p.pluginId');
function visit86_252_1(result) {
  _$jscoverage['/base.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['234'][1].init(640, 5, '!keep');
function visit85_234_1(result) {
  _$jscoverage['/base.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['227'][1].init(29, 11, 'p != plugin');
function visit84_227_1(result) {
  _$jscoverage['/base.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['222'][1].init(161, 18, 'pluginId != plugin');
function visit83_222_1(result) {
  _$jscoverage['/base.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['221'][2].init(91, 26, 'p.get && p.get(\'pluginId\')');
function visit82_221_2(result) {
  _$jscoverage['/base.js'].branchData['221'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['221'][1].init(91, 40, 'p.get && p.get(\'pluginId\') || p.pluginId');
function visit81_221_1(result) {
  _$jscoverage['/base.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['219'][1].init(25, 8, 'isString');
function visit80_219_1(result) {
  _$jscoverage['/base.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['218'][1].init(61, 6, 'plugin');
function visit79_218_1(result) {
  _$jscoverage['/base.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['214'][1].init(73, 25, 'typeof plugin == \'string\'');
function visit78_214_1(result) {
  _$jscoverage['/base.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['198'][1].init(180, 27, 'plugin[\'pluginInitializer\']');
function visit77_198_1(result) {
  _$jscoverage['/base.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['194'][1].init(46, 28, 'typeof plugin === \'function\'');
function visit76_194_1(result) {
  _$jscoverage['/base.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['179'][1].init(63, 55, '(attributeValue = self.get(attributeName)) !== undefined');
function visit75_179_1(result) {
  _$jscoverage['/base.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['178'][2].init(427, 31, 'attrs[attributeName].sync !== 0');
function visit74_178_2(result) {
  _$jscoverage['/base.js'].branchData['178'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['178'][1].init(174, 119, 'attrs[attributeName].sync !== 0 && (attributeValue = self.get(attributeName)) !== undefined');
function visit73_178_1(result) {
  _$jscoverage['/base.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['175'][1].init(250, 294, '(onSetMethod = self[onSetMethodName]) && attrs[attributeName].sync !== 0 && (attributeValue = self.get(attributeName)) !== undefined');
function visit72_175_1(result) {
  _$jscoverage['/base.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['170'][1].init(25, 22, 'attributeName in attrs');
function visit71_170_1(result) {
  _$jscoverage['/base.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['168'][1].init(29, 17, 'cs[i].ATTRS || {}');
function visit70_168_1(result) {
  _$jscoverage['/base.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['167'][1].init(379, 13, 'i < cs.length');
function visit69_167_1(result) {
  _$jscoverage['/base.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['161'][1].init(49, 40, 'c.superclass && c.superclass.constructor');
function visit68_161_1(result) {
  _$jscoverage['/base.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['141'][1].init(65, 7, 'self[m]');
function visit67_141_1(result) {
  _$jscoverage['/base.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['127'][1].init(1006, 10, 'args || []');
function visit66_127_1(result) {
  _$jscoverage['/base.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['122'][1].init(806, 7, '!member');
function visit65_122_1(result) {
  _$jscoverage['/base.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['117'][1].init(552, 5, '!name');
function visit64_117_1(result) {
  _$jscoverage['/base.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['110'][1].init(71, 18, 'method.__wrapped__');
function visit63_110_1(result) {
  _$jscoverage['/base.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['104'][2].init(110, 25, 'typeof self == \'function\'');
function visit62_104_2(result) {
  _$jscoverage['/base.js'].branchData['104'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['104'][1].init(110, 42, 'typeof self == \'function\' && self.__name__');
function visit61_104_1(result) {
  _$jscoverage['/base.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['40'][1].init(532, 7, 'reverse');
function visit60_40_1(result) {
  _$jscoverage['/base.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['36'][1].init(366, 7, 'reverse');
function visit59_36_1(result) {
  _$jscoverage['/base.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['35'][1].init(297, 47, 'arguments.callee.__owner__.__extensions__ || []');
function visit58_35_1(result) {
  _$jscoverage['/base.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['29'][1].init(54, 7, 'reverse');
function visit57_29_1(result) {
  _$jscoverage['/base.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].lineData[6]++;
KISSY.add(function(S) {
  _$jscoverage['/base.js'].functionData[0]++;
  _$jscoverage['/base.js'].lineData[7]++;
  var module = this;
  _$jscoverage['/base.js'].lineData[8]++;
  var Attribute = module.require('base/attribute');
  _$jscoverage['/base.js'].lineData[9]++;
  var CustomEvent = module.require('event/custom');
  _$jscoverage['/base.js'].lineData[11]++;
  var ATTRS = 'ATTRS', ucfirst = S.ucfirst, ON_SET = '_onSet', noop = S.noop, RE_DASH = /(?:^|-)([a-z])/ig;
  _$jscoverage['/base.js'].lineData[17]++;
  function replaceToUpper() {
    _$jscoverage['/base.js'].functionData[1]++;
    _$jscoverage['/base.js'].lineData[18]++;
    return arguments[1].toUpperCase();
  }
  _$jscoverage['/base.js'].lineData[21]++;
  function CamelCase(name) {
    _$jscoverage['/base.js'].functionData[2]++;
    _$jscoverage['/base.js'].lineData[22]++;
    return name.replace(RE_DASH, replaceToUpper);
  }
  _$jscoverage['/base.js'].lineData[25]++;
  function __getHook(method, reverse) {
    _$jscoverage['/base.js'].functionData[3]++;
    _$jscoverage['/base.js'].lineData[26]++;
    return function(origFn) {
  _$jscoverage['/base.js'].functionData[4]++;
  _$jscoverage['/base.js'].lineData[27]++;
  return function wrap() {
  _$jscoverage['/base.js'].functionData[5]++;
  _$jscoverage['/base.js'].lineData[28]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[29]++;
  if (visit57_29_1(reverse)) {
    _$jscoverage['/base.js'].lineData[30]++;
    origFn.apply(self, arguments);
  } else {
    _$jscoverage['/base.js'].lineData[32]++;
    self.callSuper.apply(self, arguments);
  }
  _$jscoverage['/base.js'].lineData[35]++;
  var extensions = visit58_35_1(arguments.callee.__owner__.__extensions__ || []);
  _$jscoverage['/base.js'].lineData[36]++;
  if (visit59_36_1(reverse)) {
    _$jscoverage['/base.js'].lineData[37]++;
    extensions.reverse();
  }
  _$jscoverage['/base.js'].lineData[39]++;
  callExtensionsMethod(self, extensions, method, arguments);
  _$jscoverage['/base.js'].lineData[40]++;
  if (visit60_40_1(reverse)) {
    _$jscoverage['/base.js'].lineData[41]++;
    self.callSuper.apply(self, arguments);
  } else {
    _$jscoverage['/base.js'].lineData[43]++;
    origFn.apply(self, arguments);
  }
};
};
  }
  _$jscoverage['/base.js'].lineData[59]++;
  function Base(config) {
    _$jscoverage['/base.js'].functionData[6]++;
    _$jscoverage['/base.js'].lineData[60]++;
    var self = this, c = self.constructor;
    _$jscoverage['/base.js'].lineData[62]++;
    Base.superclass.constructor.apply(this, arguments);
    _$jscoverage['/base.js'].lineData[63]++;
    self.__attrs = {};
    _$jscoverage['/base.js'].lineData[64]++;
    self.__attrVals = {};
    _$jscoverage['/base.js'].lineData[66]++;
    self.userConfig = config;
    _$jscoverage['/base.js'].lineData[68]++;
    while (c) {
      _$jscoverage['/base.js'].lineData[69]++;
      addAttrs(self, c[ATTRS]);
      _$jscoverage['/base.js'].lineData[70]++;
      c = c.superclass ? c.superclass.constructor : null;
    }
    _$jscoverage['/base.js'].lineData[73]++;
    initAttrs(self, config);
    _$jscoverage['/base.js'].lineData[75]++;
    var listeners = self.get("listeners");
    _$jscoverage['/base.js'].lineData[76]++;
    for (var n in listeners) {
      _$jscoverage['/base.js'].lineData[77]++;
      self.on(n, listeners[n]);
    }
    _$jscoverage['/base.js'].lineData[80]++;
    self.initializer();
    _$jscoverage['/base.js'].lineData[82]++;
    constructPlugins(self);
    _$jscoverage['/base.js'].lineData[83]++;
    callPluginsMethod.call(self, 'pluginInitializer');
    _$jscoverage['/base.js'].lineData[85]++;
    self.bindInternal();
    _$jscoverage['/base.js'].lineData[87]++;
    self.syncInternal();
  }
  _$jscoverage['/base.js'].lineData[90]++;
  S.augment(Base, Attribute);
  _$jscoverage['/base.js'].lineData[92]++;
  S.extend(Base, CustomEvent.Target, {
  initializer: noop, 
  '__getHook': __getHook, 
  __callPluginsMethod: callPluginsMethod, 
  'callSuper': function() {
  _$jscoverage['/base.js'].functionData[7]++;
  _$jscoverage['/base.js'].lineData[100]++;
  var method, obj, self = this, args = arguments;
  _$jscoverage['/base.js'].lineData[104]++;
  if (visit61_104_1(visit62_104_2(typeof self == 'function') && self.__name__)) {
    _$jscoverage['/base.js'].lineData[105]++;
    method = self;
    _$jscoverage['/base.js'].lineData[106]++;
    obj = args[0];
    _$jscoverage['/base.js'].lineData[107]++;
    args = Array.prototype.slice.call(args, 1);
  } else {
    _$jscoverage['/base.js'].lineData[109]++;
    method = arguments.callee.caller;
    _$jscoverage['/base.js'].lineData[110]++;
    if (visit63_110_1(method.__wrapped__)) {
      _$jscoverage['/base.js'].lineData[111]++;
      method = method.caller;
    }
    _$jscoverage['/base.js'].lineData[113]++;
    obj = self;
  }
  _$jscoverage['/base.js'].lineData[116]++;
  var name = method.__name__;
  _$jscoverage['/base.js'].lineData[117]++;
  if (visit64_117_1(!name)) {
    _$jscoverage['/base.js'].lineData[119]++;
    return undefined;
  }
  _$jscoverage['/base.js'].lineData[121]++;
  var member = method.__owner__.superclass[name];
  _$jscoverage['/base.js'].lineData[122]++;
  if (visit65_122_1(!member)) {
    _$jscoverage['/base.js'].lineData[124]++;
    return undefined;
  }
  _$jscoverage['/base.js'].lineData[127]++;
  return member.apply(obj, visit66_127_1(args || []));
}, 
  bindInternal: function() {
  _$jscoverage['/base.js'].functionData[8]++;
  _$jscoverage['/base.js'].lineData[135]++;
  var self = this, attrs = self['getAttrs'](), attr, m;
  _$jscoverage['/base.js'].lineData[139]++;
  for (attr in attrs) {
    _$jscoverage['/base.js'].lineData[140]++;
    m = ON_SET + ucfirst(attr);
    _$jscoverage['/base.js'].lineData[141]++;
    if (visit67_141_1(self[m])) {
      _$jscoverage['/base.js'].lineData[143]++;
      self.on('after' + ucfirst(attr) + 'Change', onSetAttrChange);
    }
  }
}, 
  syncInternal: function() {
  _$jscoverage['/base.js'].functionData[9]++;
  _$jscoverage['/base.js'].lineData[153]++;
  var self = this, cs = [], i, c = self.constructor, attrs = self.getAttrs();
  _$jscoverage['/base.js'].lineData[159]++;
  while (c) {
    _$jscoverage['/base.js'].lineData[160]++;
    cs.push(c);
    _$jscoverage['/base.js'].lineData[161]++;
    c = visit68_161_1(c.superclass && c.superclass.constructor);
  }
  _$jscoverage['/base.js'].lineData[164]++;
  cs.reverse();
  _$jscoverage['/base.js'].lineData[167]++;
  for (i = 0; visit69_167_1(i < cs.length); i++) {
    _$jscoverage['/base.js'].lineData[168]++;
    var ATTRS = visit70_168_1(cs[i].ATTRS || {});
    _$jscoverage['/base.js'].lineData[169]++;
    for (var attributeName in ATTRS) {
      _$jscoverage['/base.js'].lineData[170]++;
      if (visit71_170_1(attributeName in attrs)) {
        _$jscoverage['/base.js'].lineData[171]++;
        var attributeValue, onSetMethod;
        _$jscoverage['/base.js'].lineData[173]++;
        var onSetMethodName = ON_SET + ucfirst(attributeName);
        _$jscoverage['/base.js'].lineData[175]++;
        if (visit72_175_1((onSetMethod = self[onSetMethodName]) && visit73_178_1(visit74_178_2(attrs[attributeName].sync !== 0) && visit75_179_1((attributeValue = self.get(attributeName)) !== undefined)))) {
          _$jscoverage['/base.js'].lineData[180]++;
          onSetMethod.call(self, attributeValue);
        }
      }
    }
  }
}, 
  'plug': function(plugin) {
  _$jscoverage['/base.js'].functionData[10]++;
  _$jscoverage['/base.js'].lineData[193]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[194]++;
  if (visit76_194_1(typeof plugin === 'function')) {
    _$jscoverage['/base.js'].lineData[195]++;
    plugin = new plugin();
  }
  _$jscoverage['/base.js'].lineData[198]++;
  if (visit77_198_1(plugin['pluginInitializer'])) {
    _$jscoverage['/base.js'].lineData[199]++;
    plugin['pluginInitializer'](self);
  }
  _$jscoverage['/base.js'].lineData[201]++;
  self.get('plugins').push(plugin);
  _$jscoverage['/base.js'].lineData[202]++;
  return self;
}, 
  'unplug': function(plugin) {
  _$jscoverage['/base.js'].functionData[11]++;
  _$jscoverage['/base.js'].lineData[212]++;
  var plugins = [], self = this, isString = visit78_214_1(typeof plugin == 'string');
  _$jscoverage['/base.js'].lineData[216]++;
  S.each(self.get('plugins'), function(p) {
  _$jscoverage['/base.js'].functionData[12]++;
  _$jscoverage['/base.js'].lineData[217]++;
  var keep = 0, pluginId;
  _$jscoverage['/base.js'].lineData[218]++;
  if (visit79_218_1(plugin)) {
    _$jscoverage['/base.js'].lineData[219]++;
    if (visit80_219_1(isString)) {
      _$jscoverage['/base.js'].lineData[221]++;
      pluginId = visit81_221_1(visit82_221_2(p.get && p.get('pluginId')) || p.pluginId);
      _$jscoverage['/base.js'].lineData[222]++;
      if (visit83_222_1(pluginId != plugin)) {
        _$jscoverage['/base.js'].lineData[223]++;
        plugins.push(p);
        _$jscoverage['/base.js'].lineData[224]++;
        keep = 1;
      }
    } else {
      _$jscoverage['/base.js'].lineData[227]++;
      if (visit84_227_1(p != plugin)) {
        _$jscoverage['/base.js'].lineData[228]++;
        plugins.push(p);
        _$jscoverage['/base.js'].lineData[229]++;
        keep = 1;
      }
    }
  }
  _$jscoverage['/base.js'].lineData[234]++;
  if (visit85_234_1(!keep)) {
    _$jscoverage['/base.js'].lineData[235]++;
    p.pluginDestructor(self);
  }
});
  _$jscoverage['/base.js'].lineData[239]++;
  self.setInternal('plugins', plugins);
  _$jscoverage['/base.js'].lineData[240]++;
  return self;
}, 
  'getPlugin': function(id) {
  _$jscoverage['/base.js'].functionData[13]++;
  _$jscoverage['/base.js'].lineData[249]++;
  var plugin = null;
  _$jscoverage['/base.js'].lineData[250]++;
  S.each(this.get('plugins'), function(p) {
  _$jscoverage['/base.js'].functionData[14]++;
  _$jscoverage['/base.js'].lineData[252]++;
  var pluginId = visit86_252_1(visit87_252_2(p.get && p.get('pluginId')) || p.pluginId);
  _$jscoverage['/base.js'].lineData[253]++;
  if (visit88_253_1(pluginId == id)) {
    _$jscoverage['/base.js'].lineData[254]++;
    plugin = p;
    _$jscoverage['/base.js'].lineData[255]++;
    return false;
  }
  _$jscoverage['/base.js'].lineData[257]++;
  return undefined;
});
  _$jscoverage['/base.js'].lineData[259]++;
  return plugin;
}, 
  destructor: S.noop, 
  destroy: function() {
  _$jscoverage['/base.js'].functionData[15]++;
  _$jscoverage['/base.js'].lineData[265]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[266]++;
  if (visit89_266_1(!self.get('destroyed'))) {
    _$jscoverage['/base.js'].lineData[267]++;
    callPluginsMethod.call(self, 'pluginDestructor');
    _$jscoverage['/base.js'].lineData[268]++;
    self.destructor();
    _$jscoverage['/base.js'].lineData[269]++;
    self.set('destroyed', true);
    _$jscoverage['/base.js'].lineData[270]++;
    self.fire('destroy');
    _$jscoverage['/base.js'].lineData[271]++;
    self.detach();
  }
}});
  _$jscoverage['/base.js'].lineData[276]++;
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
  _$jscoverage['/base.js'].functionData[16]++;
  _$jscoverage['/base.js'].lineData[348]++;
  var SuperClass = this, name, SubClass;
  _$jscoverage['/base.js'].lineData[351]++;
  if (visit90_351_1(!S.isArray(extensions))) {
    _$jscoverage['/base.js'].lineData[352]++;
    sx = px;
    _$jscoverage['/base.js'].lineData[353]++;
    px = extensions;
    _$jscoverage['/base.js'].lineData[355]++;
    extensions = [];
  }
  _$jscoverage['/base.js'].lineData[357]++;
  sx = visit91_357_1(sx || {});
  _$jscoverage['/base.js'].lineData[358]++;
  name = visit92_358_1(sx.name || 'BaseDerived');
  _$jscoverage['/base.js'].lineData[359]++;
  px = S.merge(px);
  _$jscoverage['/base.js'].lineData[360]++;
  if (visit93_360_1(px.hasOwnProperty('constructor'))) {
    _$jscoverage['/base.js'].lineData[361]++;
    SubClass = px.constructor;
  } else {
    _$jscoverage['/base.js'].lineData[365]++;
    if (visit94_365_1('@DEBUG@')) {
      _$jscoverage['/base.js'].lineData[366]++;
      eval("SubClass = function " + CamelCase(name) + "(){ " + "this.callSuper.apply(this, arguments);}");
    } else {
      _$jscoverage['/base.js'].lineData[369]++;
      SubClass = function() {
  _$jscoverage['/base.js'].functionData[17]++;
  _$jscoverage['/base.js'].lineData[370]++;
  this.callSuper.apply(this, arguments);
};
    }
  }
  _$jscoverage['/base.js'].lineData[374]++;
  px.constructor = SubClass;
  _$jscoverage['/base.js'].lineData[376]++;
  var hooks = SuperClass.__hooks__;
  _$jscoverage['/base.js'].lineData[377]++;
  if (visit95_377_1(hooks)) {
    _$jscoverage['/base.js'].lineData[378]++;
    sx.__hooks__ = S.merge(hooks, sx.__hooks__);
  }
  _$jscoverage['/base.js'].lineData[380]++;
  SubClass.__extensions__ = extensions;
  _$jscoverage['/base.js'].lineData[381]++;
  wrapProtoForSuper(px, SubClass, visit96_381_1(sx.__hooks__ || {}));
  _$jscoverage['/base.js'].lineData[382]++;
  var sp = SuperClass.prototype;
  _$jscoverage['/base.js'].lineData[384]++;
  var inheritedStatics = sp['__inheritedStatics__'] = visit97_384_1(sp['__inheritedStatics__'] || sx['inheritedStatics']);
  _$jscoverage['/base.js'].lineData[385]++;
  if (visit98_385_1(sx['inheritedStatics'] && visit99_385_2(inheritedStatics !== sx['inheritedStatics']))) {
    _$jscoverage['/base.js'].lineData[386]++;
    S.mix(inheritedStatics, sx['inheritedStatics']);
  }
  _$jscoverage['/base.js'].lineData[388]++;
  if (visit100_388_1(inheritedStatics)) {
    _$jscoverage['/base.js'].lineData[389]++;
    S.mix(SubClass, inheritedStatics);
  }
  _$jscoverage['/base.js'].lineData[391]++;
  delete sx['inheritedStatics'];
  _$jscoverage['/base.js'].lineData[393]++;
  S.extend(SubClass, SuperClass, px, sx);
  _$jscoverage['/base.js'].lineData[395]++;
  if (visit101_395_1(extensions.length)) {
    _$jscoverage['/base.js'].lineData[396]++;
    var attrs = {}, prototype = {};
    _$jscoverage['/base.js'].lineData[400]++;
    S.each(extensions['concat'](SubClass), function(ext) {
  _$jscoverage['/base.js'].functionData[18]++;
  _$jscoverage['/base.js'].lineData[401]++;
  if (visit102_401_1(ext)) {
    _$jscoverage['/base.js'].lineData[411]++;
    S.each(ext[ATTRS], function(v, name) {
  _$jscoverage['/base.js'].functionData[19]++;
  _$jscoverage['/base.js'].lineData[412]++;
  var av = attrs[name] = visit103_412_1(attrs[name] || {});
  _$jscoverage['/base.js'].lineData[413]++;
  S.mix(av, v);
});
    _$jscoverage['/base.js'].lineData[416]++;
    var exp = ext.prototype, p;
    _$jscoverage['/base.js'].lineData[418]++;
    for (p in exp) {
      _$jscoverage['/base.js'].lineData[420]++;
      if (visit104_420_1(exp.hasOwnProperty(p))) {
        _$jscoverage['/base.js'].lineData[421]++;
        prototype[p] = exp[p];
      }
    }
  }
});
    _$jscoverage['/base.js'].lineData[426]++;
    SubClass[ATTRS] = attrs;
    _$jscoverage['/base.js'].lineData[427]++;
    prototype.constructor = SubClass;
    _$jscoverage['/base.js'].lineData[428]++;
    S.augment(SubClass, prototype);
  }
  _$jscoverage['/base.js'].lineData[430]++;
  SubClass.extend = visit105_430_1(SubClass.extend || extend);
  _$jscoverage['/base.js'].lineData[431]++;
  SubClass.addMembers = addMembers;
  _$jscoverage['/base.js'].lineData[432]++;
  return SubClass;
}});
  _$jscoverage['/base.js'].lineData[436]++;
  function addMembers(px) {
    _$jscoverage['/base.js'].functionData[20]++;
    _$jscoverage['/base.js'].lineData[437]++;
    var SubClass = this;
    _$jscoverage['/base.js'].lineData[438]++;
    wrapProtoForSuper(px, SubClass, visit106_438_1(SubClass.__hooks__ || {}));
    _$jscoverage['/base.js'].lineData[439]++;
    S.mix(SubClass.prototype, px);
  }
  _$jscoverage['/base.js'].lineData[466]++;
  function onSetAttrChange(e) {
    _$jscoverage['/base.js'].functionData[21]++;
    _$jscoverage['/base.js'].lineData[467]++;
    var self = this, method;
    _$jscoverage['/base.js'].lineData[470]++;
    if (visit107_470_1(e.target == self)) {
      _$jscoverage['/base.js'].lineData[471]++;
      method = self[ON_SET + e.type.slice(5).slice(0, -6)];
      _$jscoverage['/base.js'].lineData[472]++;
      method.call(self, e.newVal, e);
    }
  }
  _$jscoverage['/base.js'].lineData[476]++;
  function addAttrs(host, attrs) {
    _$jscoverage['/base.js'].functionData[22]++;
    _$jscoverage['/base.js'].lineData[477]++;
    if (visit108_477_1(attrs)) {
      _$jscoverage['/base.js'].lineData[478]++;
      for (var attr in attrs) {
        _$jscoverage['/base.js'].lineData[486]++;
        host.addAttr(attr, attrs[attr], false);
      }
    }
  }
  _$jscoverage['/base.js'].lineData[491]++;
  function initAttrs(host, config) {
    _$jscoverage['/base.js'].functionData[23]++;
    _$jscoverage['/base.js'].lineData[492]++;
    if (visit109_492_1(config)) {
      _$jscoverage['/base.js'].lineData[493]++;
      for (var attr in config) {
        _$jscoverage['/base.js'].lineData[495]++;
        host.setInternal(attr, config[attr]);
      }
    }
  }
  _$jscoverage['/base.js'].lineData[500]++;
  function constructPlugins(self) {
    _$jscoverage['/base.js'].functionData[24]++;
    _$jscoverage['/base.js'].lineData[501]++;
    var plugins = self.get('plugins');
    _$jscoverage['/base.js'].lineData[502]++;
    S.each(plugins, function(plugin, i) {
  _$jscoverage['/base.js'].functionData[25]++;
  _$jscoverage['/base.js'].lineData[503]++;
  if (visit110_503_1(typeof plugin === 'function')) {
    _$jscoverage['/base.js'].lineData[504]++;
    plugins[i] = new plugin();
  }
});
  }
  _$jscoverage['/base.js'].lineData[509]++;
  function wrapper(fn) {
    _$jscoverage['/base.js'].functionData[26]++;
    _$jscoverage['/base.js'].lineData[510]++;
    return function() {
  _$jscoverage['/base.js'].functionData[27]++;
  _$jscoverage['/base.js'].lineData[511]++;
  return fn.apply(this, arguments);
};
  }
  _$jscoverage['/base.js'].lineData[515]++;
  function wrapProtoForSuper(px, SubClass, hooks) {
    _$jscoverage['/base.js'].functionData[28]++;
    _$jscoverage['/base.js'].lineData[516]++;
    var extensions = SubClass.__extensions__;
    _$jscoverage['/base.js'].lineData[517]++;
    if (visit111_517_1(extensions.length)) {
      _$jscoverage['/base.js'].lineData[518]++;
      for (p in hooks) {
        _$jscoverage['/base.js'].lineData[519]++;
        px[p] = visit112_519_1(px[p] || noop);
      }
    }
    _$jscoverage['/base.js'].lineData[523]++;
    for (var p in hooks) {
      _$jscoverage['/base.js'].lineData[524]++;
      if (visit113_524_1(p in px)) {
        _$jscoverage['/base.js'].lineData[525]++;
        px[p] = hooks[p](px[p]);
      }
    }
    _$jscoverage['/base.js'].lineData[528]++;
    S.each(px, function(v, p) {
  _$jscoverage['/base.js'].functionData[29]++;
  _$jscoverage['/base.js'].lineData[529]++;
  if (visit114_529_1(typeof v == 'function')) {
    _$jscoverage['/base.js'].lineData[530]++;
    var wrapped = 0;
    _$jscoverage['/base.js'].lineData[531]++;
    if (visit115_531_1(v.__owner__)) {
      _$jscoverage['/base.js'].lineData[532]++;
      var originalOwner = v.__owner__;
      _$jscoverage['/base.js'].lineData[533]++;
      delete v.__owner__;
      _$jscoverage['/base.js'].lineData[534]++;
      delete v.__name__;
      _$jscoverage['/base.js'].lineData[535]++;
      wrapped = v.__wrapped__ = 1;
      _$jscoverage['/base.js'].lineData[536]++;
      var newV = wrapper(v);
      _$jscoverage['/base.js'].lineData[537]++;
      newV.__owner__ = originalOwner;
      _$jscoverage['/base.js'].lineData[538]++;
      newV.__name__ = p;
      _$jscoverage['/base.js'].lineData[539]++;
      originalOwner.prototype[p] = newV;
    } else {
      _$jscoverage['/base.js'].lineData[540]++;
      if (visit116_540_1(v.__wrapped__)) {
        _$jscoverage['/base.js'].lineData[541]++;
        wrapped = 1;
      }
    }
    _$jscoverage['/base.js'].lineData[543]++;
    if (visit117_543_1(wrapped)) {
      _$jscoverage['/base.js'].lineData[544]++;
      px[p] = v = wrapper(v);
    }
    _$jscoverage['/base.js'].lineData[546]++;
    v.__owner__ = SubClass;
    _$jscoverage['/base.js'].lineData[547]++;
    v.__name__ = p;
  }
});
  }
  _$jscoverage['/base.js'].lineData[552]++;
  function callPluginsMethod(method) {
    _$jscoverage['/base.js'].functionData[30]++;
    _$jscoverage['/base.js'].lineData[553]++;
    var len, self = this, plugins = self.get('plugins');
    _$jscoverage['/base.js'].lineData[556]++;
    if (visit118_556_1(len = plugins.length)) {
      _$jscoverage['/base.js'].lineData[557]++;
      for (var i = 0; visit119_557_1(i < len); i++) {
        _$jscoverage['/base.js'].lineData[558]++;
        visit120_558_1(plugins[i][method] && plugins[i][method](self));
      }
    }
  }
  _$jscoverage['/base.js'].lineData[563]++;
  function callExtensionsMethod(self, extensions, method, args) {
    _$jscoverage['/base.js'].functionData[31]++;
    _$jscoverage['/base.js'].lineData[564]++;
    var len;
    _$jscoverage['/base.js'].lineData[565]++;
    if (visit121_565_1(len = visit122_565_2(extensions && extensions.length))) {
      _$jscoverage['/base.js'].lineData[566]++;
      for (var i = 0; visit123_566_1(i < len); i++) {
        _$jscoverage['/base.js'].lineData[567]++;
        var fn = visit124_567_1(extensions[i] && (!method ? extensions[i] : extensions[i].prototype[method]));
        _$jscoverage['/base.js'].lineData[572]++;
        if (visit125_572_1(fn)) {
          _$jscoverage['/base.js'].lineData[573]++;
          fn.apply(self, visit126_573_1(args || []));
        }
      }
    }
  }
  _$jscoverage['/base.js'].lineData[579]++;
  return Base;
});
