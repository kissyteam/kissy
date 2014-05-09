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
if (! _$jscoverage['/control.js']) {
  _$jscoverage['/control.js'] = {};
  _$jscoverage['/control.js'].lineData = [];
  _$jscoverage['/control.js'].lineData[6] = 0;
  _$jscoverage['/control.js'].lineData[7] = 0;
  _$jscoverage['/control.js'].lineData[8] = 0;
  _$jscoverage['/control.js'].lineData[9] = 0;
  _$jscoverage['/control.js'].lineData[10] = 0;
  _$jscoverage['/control.js'].lineData[11] = 0;
  _$jscoverage['/control.js'].lineData[12] = 0;
  _$jscoverage['/control.js'].lineData[13] = 0;
  _$jscoverage['/control.js'].lineData[14] = 0;
  _$jscoverage['/control.js'].lineData[15] = 0;
  _$jscoverage['/control.js'].lineData[16] = 0;
  _$jscoverage['/control.js'].lineData[17] = 0;
  _$jscoverage['/control.js'].lineData[18] = 0;
  _$jscoverage['/control.js'].lineData[19] = 0;
  _$jscoverage['/control.js'].lineData[20] = 0;
  _$jscoverage['/control.js'].lineData[21] = 0;
  _$jscoverage['/control.js'].lineData[22] = 0;
  _$jscoverage['/control.js'].lineData[23] = 0;
  _$jscoverage['/control.js'].lineData[25] = 0;
  _$jscoverage['/control.js'].lineData[26] = 0;
  _$jscoverage['/control.js'].lineData[27] = 0;
  _$jscoverage['/control.js'].lineData[29] = 0;
  _$jscoverage['/control.js'].lineData[30] = 0;
  _$jscoverage['/control.js'].lineData[32] = 0;
  _$jscoverage['/control.js'].lineData[35] = 0;
  _$jscoverage['/control.js'].lineData[36] = 0;
  _$jscoverage['/control.js'].lineData[41] = 0;
  _$jscoverage['/control.js'].lineData[42] = 0;
  _$jscoverage['/control.js'].lineData[43] = 0;
  _$jscoverage['/control.js'].lineData[44] = 0;
  _$jscoverage['/control.js'].lineData[46] = 0;
  _$jscoverage['/control.js'].lineData[49] = 0;
  _$jscoverage['/control.js'].lineData[50] = 0;
  _$jscoverage['/control.js'].lineData[51] = 0;
  _$jscoverage['/control.js'].lineData[53] = 0;
  _$jscoverage['/control.js'].lineData[56] = 0;
  _$jscoverage['/control.js'].lineData[57] = 0;
  _$jscoverage['/control.js'].lineData[60] = 0;
  _$jscoverage['/control.js'].lineData[64] = 0;
  _$jscoverage['/control.js'].lineData[65] = 0;
  _$jscoverage['/control.js'].lineData[67] = 0;
  _$jscoverage['/control.js'].lineData[69] = 0;
  _$jscoverage['/control.js'].lineData[70] = 0;
  _$jscoverage['/control.js'].lineData[71] = 0;
  _$jscoverage['/control.js'].lineData[78] = 0;
  _$jscoverage['/control.js'].lineData[79] = 0;
  _$jscoverage['/control.js'].lineData[82] = 0;
  _$jscoverage['/control.js'].lineData[83] = 0;
  _$jscoverage['/control.js'].lineData[91] = 0;
  _$jscoverage['/control.js'].lineData[111] = 0;
  _$jscoverage['/control.js'].lineData[112] = 0;
  _$jscoverage['/control.js'].lineData[113] = 0;
  _$jscoverage['/control.js'].lineData[114] = 0;
  _$jscoverage['/control.js'].lineData[115] = 0;
  _$jscoverage['/control.js'].lineData[116] = 0;
  _$jscoverage['/control.js'].lineData[120] = 0;
  _$jscoverage['/control.js'].lineData[121] = 0;
  _$jscoverage['/control.js'].lineData[123] = 0;
  _$jscoverage['/control.js'].lineData[124] = 0;
  _$jscoverage['/control.js'].lineData[130] = 0;
  _$jscoverage['/control.js'].lineData[143] = 0;
  _$jscoverage['/control.js'].lineData[144] = 0;
  _$jscoverage['/control.js'].lineData[145] = 0;
  _$jscoverage['/control.js'].lineData[146] = 0;
  _$jscoverage['/control.js'].lineData[150] = 0;
  _$jscoverage['/control.js'].lineData[151] = 0;
  _$jscoverage['/control.js'].lineData[152] = 0;
  _$jscoverage['/control.js'].lineData[153] = 0;
  _$jscoverage['/control.js'].lineData[155] = 0;
  _$jscoverage['/control.js'].lineData[156] = 0;
  _$jscoverage['/control.js'].lineData[158] = 0;
  _$jscoverage['/control.js'].lineData[159] = 0;
  _$jscoverage['/control.js'].lineData[161] = 0;
  _$jscoverage['/control.js'].lineData[162] = 0;
  _$jscoverage['/control.js'].lineData[165] = 0;
  _$jscoverage['/control.js'].lineData[166] = 0;
  _$jscoverage['/control.js'].lineData[169] = 0;
  _$jscoverage['/control.js'].lineData[170] = 0;
  _$jscoverage['/control.js'].lineData[171] = 0;
  _$jscoverage['/control.js'].lineData[173] = 0;
  _$jscoverage['/control.js'].lineData[174] = 0;
  _$jscoverage['/control.js'].lineData[183] = 0;
  _$jscoverage['/control.js'].lineData[186] = 0;
  _$jscoverage['/control.js'].lineData[187] = 0;
  _$jscoverage['/control.js'].lineData[188] = 0;
  _$jscoverage['/control.js'].lineData[189] = 0;
  _$jscoverage['/control.js'].lineData[193] = 0;
  _$jscoverage['/control.js'].lineData[194] = 0;
  _$jscoverage['/control.js'].lineData[195] = 0;
  _$jscoverage['/control.js'].lineData[197] = 0;
  _$jscoverage['/control.js'].lineData[198] = 0;
  _$jscoverage['/control.js'].lineData[206] = 0;
  _$jscoverage['/control.js'].lineData[208] = 0;
  _$jscoverage['/control.js'].lineData[209] = 0;
  _$jscoverage['/control.js'].lineData[210] = 0;
  _$jscoverage['/control.js'].lineData[211] = 0;
  _$jscoverage['/control.js'].lineData[214] = 0;
  _$jscoverage['/control.js'].lineData[215] = 0;
  _$jscoverage['/control.js'].lineData[217] = 0;
  _$jscoverage['/control.js'].lineData[218] = 0;
  _$jscoverage['/control.js'].lineData[219] = 0;
  _$jscoverage['/control.js'].lineData[220] = 0;
  _$jscoverage['/control.js'].lineData[222] = 0;
  _$jscoverage['/control.js'].lineData[228] = 0;
  _$jscoverage['/control.js'].lineData[230] = 0;
  _$jscoverage['/control.js'].lineData[231] = 0;
  _$jscoverage['/control.js'].lineData[236] = 0;
  _$jscoverage['/control.js'].lineData[238] = 0;
  _$jscoverage['/control.js'].lineData[239] = 0;
  _$jscoverage['/control.js'].lineData[241] = 0;
  _$jscoverage['/control.js'].lineData[244] = 0;
  _$jscoverage['/control.js'].lineData[252] = 0;
  _$jscoverage['/control.js'].lineData[264] = 0;
  _$jscoverage['/control.js'].lineData[265] = 0;
  _$jscoverage['/control.js'].lineData[271] = 0;
  _$jscoverage['/control.js'].lineData[272] = 0;
  _$jscoverage['/control.js'].lineData[274] = 0;
  _$jscoverage['/control.js'].lineData[275] = 0;
  _$jscoverage['/control.js'].lineData[278] = 0;
  _$jscoverage['/control.js'].lineData[280] = 0;
  _$jscoverage['/control.js'].lineData[281] = 0;
  _$jscoverage['/control.js'].lineData[283] = 0;
  _$jscoverage['/control.js'].lineData[289] = 0;
  _$jscoverage['/control.js'].lineData[290] = 0;
  _$jscoverage['/control.js'].lineData[292] = 0;
  _$jscoverage['/control.js'].lineData[300] = 0;
  _$jscoverage['/control.js'].lineData[302] = 0;
  _$jscoverage['/control.js'].lineData[303] = 0;
  _$jscoverage['/control.js'].lineData[311] = 0;
  _$jscoverage['/control.js'].lineData[312] = 0;
  _$jscoverage['/control.js'].lineData[313] = 0;
  _$jscoverage['/control.js'].lineData[320] = 0;
  _$jscoverage['/control.js'].lineData[328] = 0;
  _$jscoverage['/control.js'].lineData[329] = 0;
  _$jscoverage['/control.js'].lineData[330] = 0;
  _$jscoverage['/control.js'].lineData[331] = 0;
  _$jscoverage['/control.js'].lineData[337] = 0;
  _$jscoverage['/control.js'].lineData[344] = 0;
  _$jscoverage['/control.js'].lineData[345] = 0;
  _$jscoverage['/control.js'].lineData[346] = 0;
  _$jscoverage['/control.js'].lineData[347] = 0;
  _$jscoverage['/control.js'].lineData[353] = 0;
  _$jscoverage['/control.js'].lineData[355] = 0;
  _$jscoverage['/control.js'].lineData[357] = 0;
  _$jscoverage['/control.js'].lineData[361] = 0;
  _$jscoverage['/control.js'].lineData[364] = 0;
  _$jscoverage['/control.js'].lineData[365] = 0;
  _$jscoverage['/control.js'].lineData[366] = 0;
  _$jscoverage['/control.js'].lineData[368] = 0;
  _$jscoverage['/control.js'].lineData[369] = 0;
  _$jscoverage['/control.js'].lineData[371] = 0;
  _$jscoverage['/control.js'].lineData[372] = 0;
  _$jscoverage['/control.js'].lineData[374] = 0;
  _$jscoverage['/control.js'].lineData[375] = 0;
  _$jscoverage['/control.js'].lineData[377] = 0;
  _$jscoverage['/control.js'].lineData[378] = 0;
  _$jscoverage['/control.js'].lineData[380] = 0;
  _$jscoverage['/control.js'].lineData[381] = 0;
  _$jscoverage['/control.js'].lineData[382] = 0;
  _$jscoverage['/control.js'].lineData[385] = 0;
  _$jscoverage['/control.js'].lineData[394] = 0;
  _$jscoverage['/control.js'].lineData[398] = 0;
  _$jscoverage['/control.js'].lineData[399] = 0;
  _$jscoverage['/control.js'].lineData[409] = 0;
  _$jscoverage['/control.js'].lineData[413] = 0;
  _$jscoverage['/control.js'].lineData[414] = 0;
  _$jscoverage['/control.js'].lineData[424] = 0;
  _$jscoverage['/control.js'].lineData[425] = 0;
  _$jscoverage['/control.js'].lineData[426] = 0;
  _$jscoverage['/control.js'].lineData[430] = 0;
  _$jscoverage['/control.js'].lineData[431] = 0;
  _$jscoverage['/control.js'].lineData[444] = 0;
  _$jscoverage['/control.js'].lineData[447] = 0;
  _$jscoverage['/control.js'].lineData[448] = 0;
  _$jscoverage['/control.js'].lineData[449] = 0;
  _$jscoverage['/control.js'].lineData[451] = 0;
  _$jscoverage['/control.js'].lineData[452] = 0;
  _$jscoverage['/control.js'].lineData[456] = 0;
  _$jscoverage['/control.js'].lineData[459] = 0;
  _$jscoverage['/control.js'].lineData[460] = 0;
  _$jscoverage['/control.js'].lineData[462] = 0;
  _$jscoverage['/control.js'].lineData[463] = 0;
  _$jscoverage['/control.js'].lineData[470] = 0;
  _$jscoverage['/control.js'].lineData[471] = 0;
  _$jscoverage['/control.js'].lineData[483] = 0;
  _$jscoverage['/control.js'].lineData[485] = 0;
  _$jscoverage['/control.js'].lineData[486] = 0;
  _$jscoverage['/control.js'].lineData[491] = 0;
  _$jscoverage['/control.js'].lineData[492] = 0;
  _$jscoverage['/control.js'].lineData[504] = 0;
  _$jscoverage['/control.js'].lineData[505] = 0;
  _$jscoverage['/control.js'].lineData[514] = 0;
  _$jscoverage['/control.js'].lineData[515] = 0;
  _$jscoverage['/control.js'].lineData[519] = 0;
  _$jscoverage['/control.js'].lineData[520] = 0;
  _$jscoverage['/control.js'].lineData[529] = 0;
  _$jscoverage['/control.js'].lineData[530] = 0;
  _$jscoverage['/control.js'].lineData[534] = 0;
  _$jscoverage['/control.js'].lineData[535] = 0;
  _$jscoverage['/control.js'].lineData[536] = 0;
  _$jscoverage['/control.js'].lineData[537] = 0;
  _$jscoverage['/control.js'].lineData[539] = 0;
  _$jscoverage['/control.js'].lineData[548] = 0;
  _$jscoverage['/control.js'].lineData[549] = 0;
  _$jscoverage['/control.js'].lineData[551] = 0;
  _$jscoverage['/control.js'].lineData[555] = 0;
  _$jscoverage['/control.js'].lineData[556] = 0;
  _$jscoverage['/control.js'].lineData[566] = 0;
  _$jscoverage['/control.js'].lineData[567] = 0;
  _$jscoverage['/control.js'].lineData[568] = 0;
  _$jscoverage['/control.js'].lineData[573] = 0;
  _$jscoverage['/control.js'].lineData[577] = 0;
  _$jscoverage['/control.js'].lineData[581] = 0;
  _$jscoverage['/control.js'].lineData[583] = 0;
  _$jscoverage['/control.js'].lineData[584] = 0;
  _$jscoverage['/control.js'].lineData[585] = 0;
  _$jscoverage['/control.js'].lineData[586] = 0;
  _$jscoverage['/control.js'].lineData[587] = 0;
  _$jscoverage['/control.js'].lineData[589] = 0;
  _$jscoverage['/control.js'].lineData[594] = 0;
  _$jscoverage['/control.js'].lineData[595] = 0;
  _$jscoverage['/control.js'].lineData[596] = 0;
  _$jscoverage['/control.js'].lineData[597] = 0;
  _$jscoverage['/control.js'].lineData[598] = 0;
  _$jscoverage['/control.js'].lineData[610] = 0;
  _$jscoverage['/control.js'].lineData[612] = 0;
  _$jscoverage['/control.js'].lineData[613] = 0;
  _$jscoverage['/control.js'].lineData[614] = 0;
  _$jscoverage['/control.js'].lineData[616] = 0;
  _$jscoverage['/control.js'].lineData[620] = 0;
  _$jscoverage['/control.js'].lineData[621] = 0;
  _$jscoverage['/control.js'].lineData[622] = 0;
  _$jscoverage['/control.js'].lineData[624] = 0;
  _$jscoverage['/control.js'].lineData[627] = 0;
  _$jscoverage['/control.js'].lineData[628] = 0;
  _$jscoverage['/control.js'].lineData[629] = 0;
  _$jscoverage['/control.js'].lineData[630] = 0;
  _$jscoverage['/control.js'].lineData[632] = 0;
  _$jscoverage['/control.js'].lineData[634] = 0;
  _$jscoverage['/control.js'].lineData[635] = 0;
  _$jscoverage['/control.js'].lineData[644] = 0;
  _$jscoverage['/control.js'].lineData[645] = 0;
  _$jscoverage['/control.js'].lineData[650] = 0;
  _$jscoverage['/control.js'].lineData[651] = 0;
  _$jscoverage['/control.js'].lineData[653] = 0;
  _$jscoverage['/control.js'].lineData[663] = 0;
  _$jscoverage['/control.js'].lineData[670] = 0;
  _$jscoverage['/control.js'].lineData[678] = 0;
  _$jscoverage['/control.js'].lineData[679] = 0;
  _$jscoverage['/control.js'].lineData[680] = 0;
  _$jscoverage['/control.js'].lineData[681] = 0;
  _$jscoverage['/control.js'].lineData[689] = 0;
  _$jscoverage['/control.js'].lineData[690] = 0;
  _$jscoverage['/control.js'].lineData[691] = 0;
  _$jscoverage['/control.js'].lineData[695] = 0;
  _$jscoverage['/control.js'].lineData[696] = 0;
  _$jscoverage['/control.js'].lineData[701] = 0;
  _$jscoverage['/control.js'].lineData[702] = 0;
  _$jscoverage['/control.js'].lineData[707] = 0;
  _$jscoverage['/control.js'].lineData[714] = 0;
  _$jscoverage['/control.js'].lineData[718] = 0;
  _$jscoverage['/control.js'].lineData[722] = 0;
  _$jscoverage['/control.js'].lineData[723] = 0;
  _$jscoverage['/control.js'].lineData[725] = 0;
  _$jscoverage['/control.js'].lineData[726] = 0;
  _$jscoverage['/control.js'].lineData[731] = 0;
  _$jscoverage['/control.js'].lineData[734] = 0;
  _$jscoverage['/control.js'].lineData[735] = 0;
  _$jscoverage['/control.js'].lineData[737] = 0;
  _$jscoverage['/control.js'].lineData[740] = 0;
  _$jscoverage['/control.js'].lineData[747] = 0;
  _$jscoverage['/control.js'].lineData[750] = 0;
  _$jscoverage['/control.js'].lineData[757] = 0;
  _$jscoverage['/control.js'].lineData[761] = 0;
  _$jscoverage['/control.js'].lineData[762] = 0;
  _$jscoverage['/control.js'].lineData[764] = 0;
  _$jscoverage['/control.js'].lineData[771] = 0;
  _$jscoverage['/control.js'].lineData[774] = 0;
  _$jscoverage['/control.js'].lineData[778] = 0;
  _$jscoverage['/control.js'].lineData[782] = 0;
  _$jscoverage['/control.js'].lineData[783] = 0;
  _$jscoverage['/control.js'].lineData[784] = 0;
  _$jscoverage['/control.js'].lineData[785] = 0;
  _$jscoverage['/control.js'].lineData[787] = 0;
  _$jscoverage['/control.js'].lineData[788] = 0;
  _$jscoverage['/control.js'].lineData[793] = 0;
  _$jscoverage['/control.js'].lineData[794] = 0;
  _$jscoverage['/control.js'].lineData[797] = 0;
  _$jscoverage['/control.js'].lineData[800] = 0;
  _$jscoverage['/control.js'].lineData[804] = 0;
  _$jscoverage['/control.js'].lineData[810] = 0;
  _$jscoverage['/control.js'].lineData[819] = 0;
  _$jscoverage['/control.js'].lineData[821] = 0;
  _$jscoverage['/control.js'].lineData[822] = 0;
  _$jscoverage['/control.js'].lineData[823] = 0;
  _$jscoverage['/control.js'].lineData[842] = 0;
  _$jscoverage['/control.js'].lineData[860] = 0;
  _$jscoverage['/control.js'].lineData[911] = 0;
  _$jscoverage['/control.js'].lineData[914] = 0;
  _$jscoverage['/control.js'].lineData[915] = 0;
  _$jscoverage['/control.js'].lineData[917] = 0;
  _$jscoverage['/control.js'].lineData[931] = 0;
  _$jscoverage['/control.js'].lineData[945] = 0;
  _$jscoverage['/control.js'].lineData[989] = 0;
  _$jscoverage['/control.js'].lineData[991] = 0;
  _$jscoverage['/control.js'].lineData[992] = 0;
  _$jscoverage['/control.js'].lineData[993] = 0;
  _$jscoverage['/control.js'].lineData[995] = 0;
  _$jscoverage['/control.js'].lineData[996] = 0;
  _$jscoverage['/control.js'].lineData[999] = 0;
  _$jscoverage['/control.js'].lineData[1002] = 0;
  _$jscoverage['/control.js'].lineData[1120] = 0;
  _$jscoverage['/control.js'].lineData[1167] = 0;
  _$jscoverage['/control.js'].lineData[1168] = 0;
  _$jscoverage['/control.js'].lineData[1169] = 0;
  _$jscoverage['/control.js'].lineData[1170] = 0;
  _$jscoverage['/control.js'].lineData[1172] = 0;
  _$jscoverage['/control.js'].lineData[1175] = 0;
  _$jscoverage['/control.js'].lineData[1200] = 0;
  _$jscoverage['/control.js'].lineData[1215] = 0;
  _$jscoverage['/control.js'].lineData[1306] = 0;
  _$jscoverage['/control.js'].lineData[1307] = 0;
  _$jscoverage['/control.js'].lineData[1309] = 0;
  _$jscoverage['/control.js'].lineData[1310] = 0;
  _$jscoverage['/control.js'].lineData[1340] = 0;
  _$jscoverage['/control.js'].lineData[1342] = 0;
  _$jscoverage['/control.js'].lineData[1348] = 0;
  _$jscoverage['/control.js'].lineData[1349] = 0;
  _$jscoverage['/control.js'].lineData[1352] = 0;
  _$jscoverage['/control.js'].lineData[1354] = 0;
  _$jscoverage['/control.js'].lineData[1356] = 0;
  _$jscoverage['/control.js'].lineData[1357] = 0;
  _$jscoverage['/control.js'].lineData[1360] = 0;
  _$jscoverage['/control.js'].lineData[1363] = 0;
  _$jscoverage['/control.js'].lineData[1365] = 0;
}
if (! _$jscoverage['/control.js'].functionData) {
  _$jscoverage['/control.js'].functionData = [];
  _$jscoverage['/control.js'].functionData[0] = 0;
  _$jscoverage['/control.js'].functionData[1] = 0;
  _$jscoverage['/control.js'].functionData[2] = 0;
  _$jscoverage['/control.js'].functionData[3] = 0;
  _$jscoverage['/control.js'].functionData[4] = 0;
  _$jscoverage['/control.js'].functionData[5] = 0;
  _$jscoverage['/control.js'].functionData[6] = 0;
  _$jscoverage['/control.js'].functionData[7] = 0;
  _$jscoverage['/control.js'].functionData[8] = 0;
  _$jscoverage['/control.js'].functionData[9] = 0;
  _$jscoverage['/control.js'].functionData[10] = 0;
  _$jscoverage['/control.js'].functionData[11] = 0;
  _$jscoverage['/control.js'].functionData[12] = 0;
  _$jscoverage['/control.js'].functionData[13] = 0;
  _$jscoverage['/control.js'].functionData[14] = 0;
  _$jscoverage['/control.js'].functionData[15] = 0;
  _$jscoverage['/control.js'].functionData[16] = 0;
  _$jscoverage['/control.js'].functionData[17] = 0;
  _$jscoverage['/control.js'].functionData[18] = 0;
  _$jscoverage['/control.js'].functionData[19] = 0;
  _$jscoverage['/control.js'].functionData[20] = 0;
  _$jscoverage['/control.js'].functionData[21] = 0;
  _$jscoverage['/control.js'].functionData[22] = 0;
  _$jscoverage['/control.js'].functionData[23] = 0;
  _$jscoverage['/control.js'].functionData[24] = 0;
  _$jscoverage['/control.js'].functionData[25] = 0;
  _$jscoverage['/control.js'].functionData[26] = 0;
  _$jscoverage['/control.js'].functionData[27] = 0;
  _$jscoverage['/control.js'].functionData[28] = 0;
  _$jscoverage['/control.js'].functionData[29] = 0;
  _$jscoverage['/control.js'].functionData[30] = 0;
  _$jscoverage['/control.js'].functionData[31] = 0;
  _$jscoverage['/control.js'].functionData[32] = 0;
  _$jscoverage['/control.js'].functionData[33] = 0;
  _$jscoverage['/control.js'].functionData[34] = 0;
  _$jscoverage['/control.js'].functionData[35] = 0;
  _$jscoverage['/control.js'].functionData[36] = 0;
  _$jscoverage['/control.js'].functionData[37] = 0;
  _$jscoverage['/control.js'].functionData[38] = 0;
  _$jscoverage['/control.js'].functionData[39] = 0;
  _$jscoverage['/control.js'].functionData[40] = 0;
  _$jscoverage['/control.js'].functionData[41] = 0;
  _$jscoverage['/control.js'].functionData[42] = 0;
  _$jscoverage['/control.js'].functionData[43] = 0;
  _$jscoverage['/control.js'].functionData[44] = 0;
  _$jscoverage['/control.js'].functionData[45] = 0;
  _$jscoverage['/control.js'].functionData[46] = 0;
  _$jscoverage['/control.js'].functionData[47] = 0;
  _$jscoverage['/control.js'].functionData[48] = 0;
  _$jscoverage['/control.js'].functionData[49] = 0;
  _$jscoverage['/control.js'].functionData[50] = 0;
  _$jscoverage['/control.js'].functionData[51] = 0;
  _$jscoverage['/control.js'].functionData[52] = 0;
  _$jscoverage['/control.js'].functionData[53] = 0;
  _$jscoverage['/control.js'].functionData[54] = 0;
  _$jscoverage['/control.js'].functionData[55] = 0;
  _$jscoverage['/control.js'].functionData[56] = 0;
  _$jscoverage['/control.js'].functionData[57] = 0;
  _$jscoverage['/control.js'].functionData[58] = 0;
  _$jscoverage['/control.js'].functionData[59] = 0;
  _$jscoverage['/control.js'].functionData[60] = 0;
  _$jscoverage['/control.js'].functionData[61] = 0;
  _$jscoverage['/control.js'].functionData[62] = 0;
  _$jscoverage['/control.js'].functionData[63] = 0;
  _$jscoverage['/control.js'].functionData[64] = 0;
  _$jscoverage['/control.js'].functionData[65] = 0;
  _$jscoverage['/control.js'].functionData[66] = 0;
  _$jscoverage['/control.js'].functionData[67] = 0;
  _$jscoverage['/control.js'].functionData[68] = 0;
  _$jscoverage['/control.js'].functionData[69] = 0;
  _$jscoverage['/control.js'].functionData[70] = 0;
  _$jscoverage['/control.js'].functionData[71] = 0;
  _$jscoverage['/control.js'].functionData[72] = 0;
  _$jscoverage['/control.js'].functionData[73] = 0;
  _$jscoverage['/control.js'].functionData[74] = 0;
}
if (! _$jscoverage['/control.js'].branchData) {
  _$jscoverage['/control.js'].branchData = {};
  _$jscoverage['/control.js'].branchData['26'] = [];
  _$jscoverage['/control.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['29'] = [];
  _$jscoverage['/control.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['41'] = [];
  _$jscoverage['/control.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['50'] = [];
  _$jscoverage['/control.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['67'] = [];
  _$jscoverage['/control.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['70'] = [];
  _$jscoverage['/control.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['79'] = [];
  _$jscoverage['/control.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['79'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['123'] = [];
  _$jscoverage['/control.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['145'] = [];
  _$jscoverage['/control.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['155'] = [];
  _$jscoverage['/control.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['158'] = [];
  _$jscoverage['/control.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['161'] = [];
  _$jscoverage['/control.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['165'] = [];
  _$jscoverage['/control.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['173'] = [];
  _$jscoverage['/control.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['210'] = [];
  _$jscoverage['/control.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['214'] = [];
  _$jscoverage['/control.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['217'] = [];
  _$jscoverage['/control.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['219'] = [];
  _$jscoverage['/control.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['230'] = [];
  _$jscoverage['/control.js'].branchData['230'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['238'] = [];
  _$jscoverage['/control.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['244'] = [];
  _$jscoverage['/control.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['265'] = [];
  _$jscoverage['/control.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['274'] = [];
  _$jscoverage['/control.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['280'] = [];
  _$jscoverage['/control.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['302'] = [];
  _$jscoverage['/control.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['366'] = [];
  _$jscoverage['/control.js'].branchData['366'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['368'] = [];
  _$jscoverage['/control.js'].branchData['368'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['371'] = [];
  _$jscoverage['/control.js'].branchData['371'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['374'] = [];
  _$jscoverage['/control.js'].branchData['374'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['377'] = [];
  _$jscoverage['/control.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['380'] = [];
  _$jscoverage['/control.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['381'] = [];
  _$jscoverage['/control.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['398'] = [];
  _$jscoverage['/control.js'].branchData['398'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['413'] = [];
  _$jscoverage['/control.js'].branchData['413'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['430'] = [];
  _$jscoverage['/control.js'].branchData['430'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['446'] = [];
  _$jscoverage['/control.js'].branchData['446'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['447'] = [];
  _$jscoverage['/control.js'].branchData['447'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['448'] = [];
  _$jscoverage['/control.js'].branchData['448'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['451'] = [];
  _$jscoverage['/control.js'].branchData['451'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['456'] = [];
  _$jscoverage['/control.js'].branchData['456'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['456'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['460'] = [];
  _$jscoverage['/control.js'].branchData['460'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['462'] = [];
  _$jscoverage['/control.js'].branchData['462'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['462'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['462'][3] = new BranchData();
  _$jscoverage['/control.js'].branchData['462'][4] = new BranchData();
  _$jscoverage['/control.js'].branchData['462'][5] = new BranchData();
  _$jscoverage['/control.js'].branchData['470'] = [];
  _$jscoverage['/control.js'].branchData['470'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['485'] = [];
  _$jscoverage['/control.js'].branchData['485'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['485'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['485'][3] = new BranchData();
  _$jscoverage['/control.js'].branchData['491'] = [];
  _$jscoverage['/control.js'].branchData['491'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['504'] = [];
  _$jscoverage['/control.js'].branchData['504'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['519'] = [];
  _$jscoverage['/control.js'].branchData['519'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['535'] = [];
  _$jscoverage['/control.js'].branchData['535'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['548'] = [];
  _$jscoverage['/control.js'].branchData['548'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['555'] = [];
  _$jscoverage['/control.js'].branchData['555'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['567'] = [];
  _$jscoverage['/control.js'].branchData['567'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['581'] = [];
  _$jscoverage['/control.js'].branchData['581'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['586'] = [];
  _$jscoverage['/control.js'].branchData['586'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['595'] = [];
  _$jscoverage['/control.js'].branchData['595'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['596'] = [];
  _$jscoverage['/control.js'].branchData['596'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['612'] = [];
  _$jscoverage['/control.js'].branchData['612'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['621'] = [];
  _$jscoverage['/control.js'].branchData['621'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['627'] = [];
  _$jscoverage['/control.js'].branchData['627'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['629'] = [];
  _$jscoverage['/control.js'].branchData['629'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['632'] = [];
  _$jscoverage['/control.js'].branchData['632'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['650'] = [];
  _$jscoverage['/control.js'].branchData['650'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['670'] = [];
  _$jscoverage['/control.js'].branchData['670'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['695'] = [];
  _$jscoverage['/control.js'].branchData['695'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['701'] = [];
  _$jscoverage['/control.js'].branchData['701'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['725'] = [];
  _$jscoverage['/control.js'].branchData['725'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['734'] = [];
  _$jscoverage['/control.js'].branchData['734'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['762'] = [];
  _$jscoverage['/control.js'].branchData['762'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['783'] = [];
  _$jscoverage['/control.js'].branchData['783'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['793'] = [];
  _$jscoverage['/control.js'].branchData['793'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['822'] = [];
  _$jscoverage['/control.js'].branchData['822'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['822'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['914'] = [];
  _$jscoverage['/control.js'].branchData['914'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['917'] = [];
  _$jscoverage['/control.js'].branchData['917'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['991'] = [];
  _$jscoverage['/control.js'].branchData['991'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['992'] = [];
  _$jscoverage['/control.js'].branchData['992'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['995'] = [];
  _$jscoverage['/control.js'].branchData['995'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['1168'] = [];
  _$jscoverage['/control.js'].branchData['1168'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['1278'] = [];
  _$jscoverage['/control.js'].branchData['1278'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['1309'] = [];
  _$jscoverage['/control.js'].branchData['1309'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['1348'] = [];
  _$jscoverage['/control.js'].branchData['1348'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['1356'] = [];
  _$jscoverage['/control.js'].branchData['1356'][1] = new BranchData();
}
_$jscoverage['/control.js'].branchData['1356'][1].init(408, 6, 'xclass');
function visit101_1356_1(result) {
  _$jscoverage['/control.js'].branchData['1356'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['1348'][1].init(216, 30, 'last && (xclass = last.xclass)');
function visit100_1348_1(result) {
  _$jscoverage['/control.js'].branchData['1348'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['1309'][1].init(171, 1, 'p');
function visit99_1309_1(result) {
  _$jscoverage['/control.js'].branchData['1309'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['1278'][1].init(61, 40, 'S.config(\'component/prefixCls\') || \'ks-\'');
function visit98_1278_1(result) {
  _$jscoverage['/control.js'].branchData['1278'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['1168'][1].init(79, 3, '!id');
function visit97_1168_1(result) {
  _$jscoverage['/control.js'].branchData['1168'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['995'][1].init(176, 19, 'xy[1] !== undefined');
function visit96_995_1(result) {
  _$jscoverage['/control.js'].branchData['995'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['992'][1].init(34, 19, 'xy[0] !== undefined');
function visit95_992_1(result) {
  _$jscoverage['/control.js'].branchData['992'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['991'][1].init(122, 9, 'xy.length');
function visit94_991_1(result) {
  _$jscoverage['/control.js'].branchData['991'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['917'][1].init(163, 7, 'v || []');
function visit93_917_1(result) {
  _$jscoverage['/control.js'].branchData['917'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['914'][1].init(30, 21, 'typeof v === \'string\'');
function visit92_914_1(result) {
  _$jscoverage['/control.js'].branchData['914'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['822'][2].init(153, 17, 'destroy !== false');
function visit91_822_2(result) {
  _$jscoverage['/control.js'].branchData['822'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['822'][1].init(153, 29, 'destroy !== false && self.$el');
function visit90_822_1(result) {
  _$jscoverage['/control.js'].branchData['822'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['793'][1].init(186, 45, 'target.ownerDocument.activeElement === target');
function visit89_793_1(result) {
  _$jscoverage['/control.js'].branchData['793'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['783'][1].init(81, 1, 'v');
function visit88_783_1(result) {
  _$jscoverage['/control.js'].branchData['783'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['762'][1].init(278, 21, 'self.get(\'focusable\')');
function visit87_762_1(result) {
  _$jscoverage['/control.js'].branchData['762'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['734'][1].init(159, 7, 'visible');
function visit86_734_1(result) {
  _$jscoverage['/control.js'].branchData['734'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['725'][1].init(158, 31, '!this.get(\'allowTextSelection\')');
function visit85_725_1(result) {
  _$jscoverage['/control.js'].branchData['725'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['701'][1].init(22, 21, 'this.get(\'focusable\')');
function visit84_701_1(result) {
  _$jscoverage['/control.js'].branchData['701'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['695'][1].init(22, 21, 'this.get(\'focusable\')');
function visit83_695_1(result) {
  _$jscoverage['/control.js'].branchData['695'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['670'][1].init(54, 14, 'parent || this');
function visit82_670_1(result) {
  _$jscoverage['/control.js'].branchData['670'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['650'][1].init(315, 5, 'i < l');
function visit81_650_1(result) {
  _$jscoverage['/control.js'].branchData['650'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['632'][1].init(186, 60, 'constructor.superclass && constructor.superclass.constructor');
function visit80_632_1(result) {
  _$jscoverage['/control.js'].branchData['632'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['629'][1].init(76, 6, 'xclass');
function visit79_629_1(result) {
  _$jscoverage['/control.js'].branchData['629'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['627'][1].init(293, 65, 'constructor && !constructor.prototype.hasOwnProperty(\'isControl\')');
function visit78_627_1(result) {
  _$jscoverage['/control.js'].branchData['627'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['621'][1].init(56, 24, 'self.componentCssClasses');
function visit77_621_1(result) {
  _$jscoverage['/control.js'].branchData['621'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['612'][1].init(101, 3, 'cls');
function visit76_612_1(result) {
  _$jscoverage['/control.js'].branchData['612'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['596'][1].init(130, 37, 'renderCommands || self.renderCommands');
function visit75_596_1(result) {
  _$jscoverage['/control.js'].branchData['596'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['595'][1].init(65, 29, 'renderData || self.renderData');
function visit74_595_1(result) {
  _$jscoverage['/control.js'].branchData['595'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['586'][1].init(147, 24, 'typeof node === \'string\'');
function visit73_586_1(result) {
  _$jscoverage['/control.js'].branchData['586'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['581'][1].init(154, 47, 'childrenElSelectors || self.childrenElSelectors');
function visit72_581_1(result) {
  _$jscoverage['/control.js'].branchData['581'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['567'][1].init(102, 21, 'self.get(\'focusable\')');
function visit71_567_1(result) {
  _$jscoverage['/control.js'].branchData['567'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['555'][1].init(22, 21, '!this.get(\'disabled\')');
function visit70_555_1(result) {
  _$jscoverage['/control.js'].branchData['555'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['548'][1].init(22, 33, 'ev.keyCode === Node.KeyCode.ENTER');
function visit69_548_1(result) {
  _$jscoverage['/control.js'].branchData['548'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['535'][1].init(56, 55, '!this.get(\'disabled\') && self.handleKeyDownInternal(ev)');
function visit68_535_1(result) {
  _$jscoverage['/control.js'].branchData['535'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['519'][1].init(22, 21, '!this.get(\'disabled\')');
function visit67_519_1(result) {
  _$jscoverage['/control.js'].branchData['519'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['504'][1].init(22, 21, '!this.get(\'disabled\')');
function visit66_504_1(result) {
  _$jscoverage['/control.js'].branchData['504'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['491'][1].init(22, 21, '!this.get(\'disabled\')');
function visit65_491_1(result) {
  _$jscoverage['/control.js'].branchData['491'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['485'][3].init(102, 14, 'ev.which === 1');
function visit64_485_3(result) {
  _$jscoverage['/control.js'].branchData['485'][3].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['485'][2].init(102, 41, 'ev.which === 1 || isTouchGestureSupported');
function visit63_485_2(result) {
  _$jscoverage['/control.js'].branchData['485'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['485'][1].init(79, 65, 'self.get(\'active\') && (ev.which === 1 || isTouchGestureSupported)');
function visit62_485_1(result) {
  _$jscoverage['/control.js'].branchData['485'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['470'][1].init(22, 21, '!this.get(\'disabled\')');
function visit61_470_1(result) {
  _$jscoverage['/control.js'].branchData['470'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['462'][5].init(360, 14, 'n !== \'button\'');
function visit60_462_5(result) {
  _$jscoverage['/control.js'].branchData['462'][5].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['462'][4].init(340, 16, 'n !== \'textarea\'');
function visit59_462_4(result) {
  _$jscoverage['/control.js'].branchData['462'][4].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['462'][3].init(340, 34, 'n !== \'textarea\' && n !== \'button\'');
function visit58_462_3(result) {
  _$jscoverage['/control.js'].branchData['462'][3].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['462'][2].init(323, 13, 'n !== \'input\'');
function visit57_462_2(result) {
  _$jscoverage['/control.js'].branchData['462'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['462'][1].init(323, 51, 'n !== \'input\' && n !== \'textarea\' && n !== \'button\'');
function visit56_462_1(result) {
  _$jscoverage['/control.js'].branchData['462'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['460'][1].init(192, 20, 'n && n.toLowerCase()');
function visit55_460_1(result) {
  _$jscoverage['/control.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['456'][2].init(417, 26, 'ev.gestureType === \'mouse\'');
function visit54_456_2(result) {
  _$jscoverage['/control.js'].branchData['456'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['456'][1].init(382, 61, '!self.get(\'allowTextSelection\') && ev.gestureType === \'mouse\'');
function visit53_456_1(result) {
  _$jscoverage['/control.js'].branchData['456'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['451'][1].init(151, 21, 'self.get(\'focusable\')');
function visit52_451_1(result) {
  _$jscoverage['/control.js'].branchData['451'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['448'][1].init(26, 22, 'self.get(\'activeable\')');
function visit51_448_1(result) {
  _$jscoverage['/control.js'].branchData['448'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['447'][1].init(139, 46, 'isMouseActionButton || isTouchGestureSupported');
function visit50_447_1(result) {
  _$jscoverage['/control.js'].branchData['447'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['446'][1].init(83, 14, 'ev.which === 1');
function visit49_446_1(result) {
  _$jscoverage['/control.js'].branchData['446'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['430'][1].init(22, 21, '!this.get(\'disabled\')');
function visit48_430_1(result) {
  _$jscoverage['/control.js'].branchData['430'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['413'][1].init(22, 21, '!this.get(\'disabled\')');
function visit47_413_1(result) {
  _$jscoverage['/control.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['398'][1].init(22, 21, '!this.get(\'disabled\')');
function visit46_398_1(result) {
  _$jscoverage['/control.js'].branchData['398'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['381'][1].init(26, 17, 'p.pluginCreateDom');
function visit45_381_1(result) {
  _$jscoverage['/control.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['380'][1].init(796, 19, 'self.get(\'created\')');
function visit44_380_1(result) {
  _$jscoverage['/control.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['377'][1].init(433, 14, 'p.pluginSyncUI');
function visit43_377_1(result) {
  _$jscoverage['/control.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['374'][1].init(320, 14, 'p.pluginBindUI');
function visit42_374_1(result) {
  _$jscoverage['/control.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['371'][1].init(202, 16, 'p.pluginRenderUI');
function visit41_371_1(result) {
  _$jscoverage['/control.js'].branchData['371'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['368'][1].init(83, 17, 'p.pluginCreateDom');
function visit40_368_1(result) {
  _$jscoverage['/control.js'].branchData['368'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['366'][1].init(223, 20, 'self.get(\'rendered\')');
function visit39_366_1(result) {
  _$jscoverage['/control.js'].branchData['366'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['302'][1].init(84, 21, '!self.get(\'rendered\')');
function visit38_302_1(result) {
  _$jscoverage['/control.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['280'][1].init(759, 8, '!srcNode');
function visit37_280_1(result) {
  _$jscoverage['/control.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['274'][1].init(412, 7, 'srcNode');
function visit36_274_1(result) {
  _$jscoverage['/control.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['265'][1].init(56, 20, '!self.get(\'created\')');
function visit35_265_1(result) {
  _$jscoverage['/control.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['244'][1].init(778, 31, 'self.get(\'handleGestureEvents\')');
function visit34_244_1(result) {
  _$jscoverage['/control.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['238'][1].init(460, 13, 'UA.ieMode < 9');
function visit33_238_1(result) {
  _$jscoverage['/control.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['230'][1].init(58, 21, 'self.get(\'focusable\')');
function visit32_230_1(result) {
  _$jscoverage['/control.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['219'][1].init(259, 6, 'render');
function visit31_219_1(result) {
  _$jscoverage['/control.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['217'][1].init(142, 12, 'renderBefore');
function visit30_217_1(result) {
  _$jscoverage['/control.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['214'][1].init(344, 20, '!self.get(\'srcNode\')');
function visit29_214_1(result) {
  _$jscoverage['/control.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['210'][1].init(171, 31, '!self.get(\'allowTextSelection\')');
function visit28_210_1(result) {
  _$jscoverage['/control.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['173'][1].init(1517, 23, 'self.get(\'highlighted\')');
function visit27_173_1(result) {
  _$jscoverage['/control.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['165'][1].init(1194, 8, '!visible');
function visit26_165_1(result) {
  _$jscoverage['/control.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['161'][1].init(1092, 6, 'zIndex');
function visit25_161_1(result) {
  _$jscoverage['/control.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['158'][1].init(986, 6, 'height');
function visit24_158_1(result) {
  _$jscoverage['/control.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['155'][1].init(883, 5, 'width');
function visit23_155_1(result) {
  _$jscoverage['/control.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['145'][1].init(71, 11, 'attr.render');
function visit22_145_1(result) {
  _$jscoverage['/control.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['123'][1].init(114, 13, 'attr.selector');
function visit21_123_1(result) {
  _$jscoverage['/control.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['79'][2].init(56, 35, 'options.params && options.params[0]');
function visit20_79_2(result) {
  _$jscoverage['/control.js'].branchData['79'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['79'][1].init(55, 46, 'options && options.params && options.params[0]');
function visit19_79_1(result) {
  _$jscoverage['/control.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['70'][1].init(112, 17, 'ret !== undefined');
function visit18_70_1(result) {
  _$jscoverage['/control.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['67'][1].init(90, 10, 'attr.parse');
function visit17_67_1(result) {
  _$jscoverage['/control.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['50'][1].init(14, 21, 'typeof v === \'number\'');
function visit16_50_1(result) {
  _$jscoverage['/control.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['41'][1].init(156, 5, 'i < l');
function visit15_41_1(result) {
  _$jscoverage['/control.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['29'][1].init(77, 26, 'typeof extras === \'string\'');
function visit14_29_1(result) {
  _$jscoverage['/control.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['26'][1].init(14, 7, '!extras');
function visit13_26_1(result) {
  _$jscoverage['/control.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/control.js'].functionData[0]++;
  _$jscoverage['/control.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/control.js'].lineData[8]++;
  var BaseGesture = require('event/gesture/base');
  _$jscoverage['/control.js'].lineData[9]++;
  var TapGesture = require('event/gesture/tap');
  _$jscoverage['/control.js'].lineData[10]++;
  var Manager = require('./control/manager');
  _$jscoverage['/control.js'].lineData[11]++;
  var Base = require('base');
  _$jscoverage['/control.js'].lineData[12]++;
  var RenderTpl = require('./control/render-xtpl');
  _$jscoverage['/control.js'].lineData[13]++;
  var UA = require('ua');
  _$jscoverage['/control.js'].lineData[14]++;
  var Feature = S.Feature;
  _$jscoverage['/control.js'].lineData[15]++;
  var __getHook = Base.prototype.__getHook;
  _$jscoverage['/control.js'].lineData[16]++;
  var startTpl = RenderTpl;
  _$jscoverage['/control.js'].lineData[17]++;
  var endTpl = '</div>';
  _$jscoverage['/control.js'].lineData[18]++;
  var isTouchGestureSupported = Feature.isTouchGestureSupported();
  _$jscoverage['/control.js'].lineData[19]++;
  var noop = S.noop;
  _$jscoverage['/control.js'].lineData[20]++;
  var XTemplateRuntime = require('xtemplate/runtime');
  _$jscoverage['/control.js'].lineData[21]++;
  var trim = S.trim;
  _$jscoverage['/control.js'].lineData[22]++;
  var $ = Node.all;
  _$jscoverage['/control.js'].lineData[23]++;
  var doc = S.Env.host.document;
  _$jscoverage['/control.js'].lineData[25]++;
  function normalExtras(extras) {
    _$jscoverage['/control.js'].functionData[1]++;
    _$jscoverage['/control.js'].lineData[26]++;
    if (visit13_26_1(!extras)) {
      _$jscoverage['/control.js'].lineData[27]++;
      extras = [''];
    }
    _$jscoverage['/control.js'].lineData[29]++;
    if (visit14_29_1(typeof extras === 'string')) {
      _$jscoverage['/control.js'].lineData[30]++;
      extras = extras.split(/\s+/);
    }
    _$jscoverage['/control.js'].lineData[32]++;
    return extras;
  }
  _$jscoverage['/control.js'].lineData[35]++;
  function prefixExtra(prefixCls, componentCls, extras) {
    _$jscoverage['/control.js'].functionData[2]++;
    _$jscoverage['/control.js'].lineData[36]++;
    var cls = '', i = 0, l = extras.length, e, prefix = prefixCls + componentCls;
    _$jscoverage['/control.js'].lineData[41]++;
    for (; visit15_41_1(i < l); i++) {
      _$jscoverage['/control.js'].lineData[42]++;
      e = extras[i];
      _$jscoverage['/control.js'].lineData[43]++;
      e = e ? ('-' + e) : e;
      _$jscoverage['/control.js'].lineData[44]++;
      cls += ' ' + prefix + e;
    }
    _$jscoverage['/control.js'].lineData[46]++;
    return cls;
  }
  _$jscoverage['/control.js'].lineData[49]++;
  function pxSetter(v) {
    _$jscoverage['/control.js'].functionData[3]++;
    _$jscoverage['/control.js'].lineData[50]++;
    if (visit16_50_1(typeof v === 'number')) {
      _$jscoverage['/control.js'].lineData[51]++;
      v += 'px';
    }
    _$jscoverage['/control.js'].lineData[53]++;
    return v;
  }
  _$jscoverage['/control.js'].lineData[56]++;
  function applyParser(srcNode) {
    _$jscoverage['/control.js'].functionData[4]++;
    _$jscoverage['/control.js'].lineData[57]++;
    var self = this, attr, attrName, ret;
    _$jscoverage['/control.js'].lineData[60]++;
    var attrs = self.getAttrs();
    _$jscoverage['/control.js'].lineData[64]++;
    for (attrName in attrs) {
      _$jscoverage['/control.js'].lineData[65]++;
      attr = attrs[attrName];
      _$jscoverage['/control.js'].lineData[67]++;
      if (visit17_67_1(attr.parse)) {
        _$jscoverage['/control.js'].lineData[69]++;
        ret = attr.parse.call(self, srcNode);
        _$jscoverage['/control.js'].lineData[70]++;
        if (visit18_70_1(ret !== undefined)) {
          _$jscoverage['/control.js'].lineData[71]++;
          self.setInternal(attrName, ret);
        }
      }
    }
  }
  _$jscoverage['/control.js'].lineData[78]++;
  function getBaseCssClassesCmd(_, options) {
    _$jscoverage['/control.js'].functionData[5]++;
    _$jscoverage['/control.js'].lineData[79]++;
    return this.config.control.getBaseCssClasses(visit19_79_1(options && visit20_79_2(options.params && options.params[0])));
  }
  _$jscoverage['/control.js'].lineData[82]++;
  function getBaseCssClassCmd() {
    _$jscoverage['/control.js'].functionData[6]++;
    _$jscoverage['/control.js'].lineData[83]++;
    return this.config.control.getBaseCssClass(arguments[1].params[0]);
  }
  _$jscoverage['/control.js'].lineData[91]++;
  var Control = Base.extend({
  isControl: true, 
  bindInternal: noop, 
  syncInternal: noop, 
  initializer: function() {
  _$jscoverage['/control.js'].functionData[7]++;
  _$jscoverage['/control.js'].lineData[111]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[112]++;
  var attrName, attr;
  _$jscoverage['/control.js'].lineData[113]++;
  var attrs = self.getAttrs();
  _$jscoverage['/control.js'].lineData[114]++;
  self.renderData = {};
  _$jscoverage['/control.js'].lineData[115]++;
  self.childrenElSelectors = {};
  _$jscoverage['/control.js'].lineData[116]++;
  self.renderCommands = {
  getBaseCssClasses: getBaseCssClassesCmd, 
  getBaseCssClass: getBaseCssClassCmd};
  _$jscoverage['/control.js'].lineData[120]++;
  for (attrName in attrs) {
    _$jscoverage['/control.js'].lineData[121]++;
    attr = attrs[attrName];
    _$jscoverage['/control.js'].lineData[123]++;
    if (visit21_123_1(attr.selector)) {
      _$jscoverage['/control.js'].lineData[124]++;
      self.childrenElSelectors[attrName] = attr.selector;
    }
  }
}, 
  beforeCreateDom: function(renderData) {
  _$jscoverage['/control.js'].functionData[8]++;
  _$jscoverage['/control.js'].lineData[130]++;
  var self = this, width, height, visible, elAttrs = self.get('elAttrs'), disabled, attrs = self.getAttrs(), attrName, attr, elStyle = self.get('elStyle'), zIndex, elCls = self.get('elCls');
  _$jscoverage['/control.js'].lineData[143]++;
  for (attrName in attrs) {
    _$jscoverage['/control.js'].lineData[144]++;
    attr = attrs[attrName];
    _$jscoverage['/control.js'].lineData[145]++;
    if (visit22_145_1(attr.render)) {
      _$jscoverage['/control.js'].lineData[146]++;
      renderData[attrName] = self.get(attrName);
    }
  }
  _$jscoverage['/control.js'].lineData[150]++;
  width = renderData.width;
  _$jscoverage['/control.js'].lineData[151]++;
  height = renderData.height;
  _$jscoverage['/control.js'].lineData[152]++;
  visible = renderData.visible;
  _$jscoverage['/control.js'].lineData[153]++;
  zIndex = renderData.zIndex;
  _$jscoverage['/control.js'].lineData[155]++;
  if (visit23_155_1(width)) {
    _$jscoverage['/control.js'].lineData[156]++;
    elStyle.width = pxSetter(width);
  }
  _$jscoverage['/control.js'].lineData[158]++;
  if (visit24_158_1(height)) {
    _$jscoverage['/control.js'].lineData[159]++;
    elStyle.height = pxSetter(height);
  }
  _$jscoverage['/control.js'].lineData[161]++;
  if (visit25_161_1(zIndex)) {
    _$jscoverage['/control.js'].lineData[162]++;
    elStyle['z-index'] = zIndex;
  }
  _$jscoverage['/control.js'].lineData[165]++;
  if (visit26_165_1(!visible)) {
    _$jscoverage['/control.js'].lineData[166]++;
    elCls.push(self.getBaseCssClasses('hidden'));
  }
  _$jscoverage['/control.js'].lineData[169]++;
  if ((disabled = self.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[170]++;
    elCls.push(self.getBaseCssClasses('disabled'));
    _$jscoverage['/control.js'].lineData[171]++;
    elAttrs['aria-disabled'] = 'true';
  }
  _$jscoverage['/control.js'].lineData[173]++;
  if (visit27_173_1(self.get('highlighted'))) {
    _$jscoverage['/control.js'].lineData[174]++;
    elCls.push(self.getBaseCssClasses('hover'));
  }
}, 
  createDom: function() {
  _$jscoverage['/control.js'].functionData[9]++;
  _$jscoverage['/control.js'].lineData[183]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[186]++;
  var html = self.renderTpl(startTpl) + self.renderTpl(self.get('contentTpl')) + endTpl;
  _$jscoverage['/control.js'].lineData[187]++;
  self.$el = $(html);
  _$jscoverage['/control.js'].lineData[188]++;
  self.el = self.$el[0];
  _$jscoverage['/control.js'].lineData[189]++;
  self.fillChildrenElsBySelectors();
}, 
  decorateDom: function(srcNode) {
  _$jscoverage['/control.js'].functionData[10]++;
  _$jscoverage['/control.js'].lineData[193]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[194]++;
  self.$el = srcNode;
  _$jscoverage['/control.js'].lineData[195]++;
  self.el = srcNode[0];
  _$jscoverage['/control.js'].lineData[197]++;
  self.fillChildrenElsBySelectors();
  _$jscoverage['/control.js'].lineData[198]++;
  applyParser.call(self, srcNode);
}, 
  renderUI: function() {
  _$jscoverage['/control.js'].functionData[11]++;
  _$jscoverage['/control.js'].lineData[206]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[208]++;
  Manager.addComponent(self);
  _$jscoverage['/control.js'].lineData[209]++;
  var $el = self.$el;
  _$jscoverage['/control.js'].lineData[210]++;
  if (visit28_210_1(!self.get('allowTextSelection'))) {
    _$jscoverage['/control.js'].lineData[211]++;
    $el.unselectable();
  }
  _$jscoverage['/control.js'].lineData[214]++;
  if (visit29_214_1(!self.get('srcNode'))) {
    _$jscoverage['/control.js'].lineData[215]++;
    var render = self.get('render'), renderBefore = self.get('elBefore');
    _$jscoverage['/control.js'].lineData[217]++;
    if (visit30_217_1(renderBefore)) {
      _$jscoverage['/control.js'].lineData[218]++;
      $el.insertBefore(renderBefore, undefined);
    } else {
      _$jscoverage['/control.js'].lineData[219]++;
      if (visit31_219_1(render)) {
        _$jscoverage['/control.js'].lineData[220]++;
        $el.appendTo(render, undefined);
      } else {
        _$jscoverage['/control.js'].lineData[222]++;
        $el.appendTo(doc.body, undefined);
      }
    }
  }
}, 
  bindUI: function() {
  _$jscoverage['/control.js'].functionData[12]++;
  _$jscoverage['/control.js'].lineData[228]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[230]++;
  if (visit32_230_1(self.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[231]++;
    var keyEventTarget = self.getKeyEventTarget();
    _$jscoverage['/control.js'].lineData[236]++;
    keyEventTarget.on('focus', self.handleFocus, self).on('blur', self.handleBlur, self).on('keydown', self.handleKeydown, self);
    _$jscoverage['/control.js'].lineData[238]++;
    if (visit33_238_1(UA.ieMode < 9)) {
      _$jscoverage['/control.js'].lineData[239]++;
      keyEventTarget.attr('hideFocus', true);
    }
    _$jscoverage['/control.js'].lineData[241]++;
    keyEventTarget.attr('tabindex', self.get('disabled') ? '-1' : '0');
  }
  _$jscoverage['/control.js'].lineData[244]++;
  if (visit34_244_1(self.get('handleGestureEvents'))) {
    _$jscoverage['/control.js'].lineData[252]++;
    self.$el.on('mouseenter', self.handleMouseEnter, self).on('mouseleave', self.handleMouseLeave, self).on('contextmenu', self.handleContextMenu, self).on(BaseGesture.START, self.handleMouseDown, self).on(BaseGesture.END, self.handleMouseUp, self).on(TapGesture.TAP, self.handleClick, self);
  }
}, 
  syncUI: noop, 
  create: function() {
  _$jscoverage['/control.js'].functionData[13]++;
  _$jscoverage['/control.js'].lineData[264]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[265]++;
  if (visit35_265_1(!self.get('created'))) {
    _$jscoverage['/control.js'].lineData[271]++;
    self.fire('beforeCreateDom');
    _$jscoverage['/control.js'].lineData[272]++;
    var srcNode = self.get('srcNode');
    _$jscoverage['/control.js'].lineData[274]++;
    if (visit36_274_1(srcNode)) {
      _$jscoverage['/control.js'].lineData[275]++;
      self.decorateDom(srcNode);
    }
    _$jscoverage['/control.js'].lineData[278]++;
    self.beforeCreateDom(self.renderData, self.renderCommands, self.childrenElSelectors);
    _$jscoverage['/control.js'].lineData[280]++;
    if (visit37_280_1(!srcNode)) {
      _$jscoverage['/control.js'].lineData[281]++;
      self.createDom();
    }
    _$jscoverage['/control.js'].lineData[283]++;
    self.__callPluginsMethod('pluginCreateDom');
    _$jscoverage['/control.js'].lineData[289]++;
    self.fire('afterCreateDom');
    _$jscoverage['/control.js'].lineData[290]++;
    self.setInternal('created', true);
  }
  _$jscoverage['/control.js'].lineData[292]++;
  return self;
}, 
  render: function() {
  _$jscoverage['/control.js'].functionData[14]++;
  _$jscoverage['/control.js'].lineData[300]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[302]++;
  if (visit38_302_1(!self.get('rendered'))) {
    _$jscoverage['/control.js'].lineData[303]++;
    self.create();
    _$jscoverage['/control.js'].lineData[311]++;
    self.fire('beforeRenderUI');
    _$jscoverage['/control.js'].lineData[312]++;
    self.renderUI();
    _$jscoverage['/control.js'].lineData[313]++;
    self.__callPluginsMethod('pluginRenderUI');
    _$jscoverage['/control.js'].lineData[320]++;
    self.fire('afterRenderUI');
    _$jscoverage['/control.js'].lineData[328]++;
    self.fire('beforeBindUI');
    _$jscoverage['/control.js'].lineData[329]++;
    Control.superclass.bindInternal.call(self);
    _$jscoverage['/control.js'].lineData[330]++;
    self.bindUI();
    _$jscoverage['/control.js'].lineData[331]++;
    self.__callPluginsMethod('pluginBindUI');
    _$jscoverage['/control.js'].lineData[337]++;
    self.fire('afterBindUI');
    _$jscoverage['/control.js'].lineData[344]++;
    self.fire('beforeSyncUI');
    _$jscoverage['/control.js'].lineData[345]++;
    Control.superclass.syncInternal.call(self);
    _$jscoverage['/control.js'].lineData[346]++;
    self.syncUI();
    _$jscoverage['/control.js'].lineData[347]++;
    self.__callPluginsMethod('pluginSyncUI');
    _$jscoverage['/control.js'].lineData[353]++;
    self.fire('afterSyncUI');
    _$jscoverage['/control.js'].lineData[355]++;
    self.setInternal('rendered', true);
  }
  _$jscoverage['/control.js'].lineData[357]++;
  return self;
}, 
  plug: function(plugin) {
  _$jscoverage['/control.js'].functionData[15]++;
  _$jscoverage['/control.js'].lineData[361]++;
  var self = this, p, plugins = self.get('plugins');
  _$jscoverage['/control.js'].lineData[364]++;
  self.callSuper(plugin);
  _$jscoverage['/control.js'].lineData[365]++;
  p = plugins[plugins.length - 1];
  _$jscoverage['/control.js'].lineData[366]++;
  if (visit39_366_1(self.get('rendered'))) {
    _$jscoverage['/control.js'].lineData[368]++;
    if (visit40_368_1(p.pluginCreateDom)) {
      _$jscoverage['/control.js'].lineData[369]++;
      p.pluginCreateDom(self);
    }
    _$jscoverage['/control.js'].lineData[371]++;
    if (visit41_371_1(p.pluginRenderUI)) {
      _$jscoverage['/control.js'].lineData[372]++;
      p.pluginCreateDom(self);
    }
    _$jscoverage['/control.js'].lineData[374]++;
    if (visit42_374_1(p.pluginBindUI)) {
      _$jscoverage['/control.js'].lineData[375]++;
      p.pluginBindUI(self);
    }
    _$jscoverage['/control.js'].lineData[377]++;
    if (visit43_377_1(p.pluginSyncUI)) {
      _$jscoverage['/control.js'].lineData[378]++;
      p.pluginSyncUI(self);
    }
  } else {
    _$jscoverage['/control.js'].lineData[380]++;
    if (visit44_380_1(self.get('created'))) {
      _$jscoverage['/control.js'].lineData[381]++;
      if (visit45_381_1(p.pluginCreateDom)) {
        _$jscoverage['/control.js'].lineData[382]++;
        p.pluginCreateDom(self);
      }
    }
  }
  _$jscoverage['/control.js'].lineData[385]++;
  return self;
}, 
  getKeyEventTarget: function() {
  _$jscoverage['/control.js'].functionData[16]++;
  _$jscoverage['/control.js'].lineData[394]++;
  return this.$el;
}, 
  handleMouseEnter: function(ev) {
  _$jscoverage['/control.js'].functionData[17]++;
  _$jscoverage['/control.js'].lineData[398]++;
  if (visit46_398_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[399]++;
    this.handleMouseEnterInternal(ev);
  }
}, 
  handleMouseEnterInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[18]++;
  _$jscoverage['/control.js'].lineData[409]++;
  this.set('highlighted', !!ev);
}, 
  handleMouseLeave: function(ev) {
  _$jscoverage['/control.js'].functionData[19]++;
  _$jscoverage['/control.js'].lineData[413]++;
  if (visit47_413_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[414]++;
    this.handleMouseLeaveInternal(ev);
  }
}, 
  handleMouseLeaveInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[20]++;
  _$jscoverage['/control.js'].lineData[424]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[425]++;
  self.set('active', false);
  _$jscoverage['/control.js'].lineData[426]++;
  self.set('highlighted', !ev);
}, 
  handleMouseDown: function(ev) {
  _$jscoverage['/control.js'].functionData[21]++;
  _$jscoverage['/control.js'].lineData[430]++;
  if (visit48_430_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[431]++;
    this.handleMouseDownInternal(ev);
  }
}, 
  handleMouseDownInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[22]++;
  _$jscoverage['/control.js'].lineData[444]++;
  var self = this, n, isMouseActionButton = visit49_446_1(ev.which === 1);
  _$jscoverage['/control.js'].lineData[447]++;
  if (visit50_447_1(isMouseActionButton || isTouchGestureSupported)) {
    _$jscoverage['/control.js'].lineData[448]++;
    if (visit51_448_1(self.get('activeable'))) {
      _$jscoverage['/control.js'].lineData[449]++;
      self.set('active', true);
    }
    _$jscoverage['/control.js'].lineData[451]++;
    if (visit52_451_1(self.get('focusable'))) {
      _$jscoverage['/control.js'].lineData[452]++;
      self.focus();
    }
    _$jscoverage['/control.js'].lineData[456]++;
    if (visit53_456_1(!self.get('allowTextSelection') && visit54_456_2(ev.gestureType === 'mouse'))) {
      _$jscoverage['/control.js'].lineData[459]++;
      n = ev.target.nodeName;
      _$jscoverage['/control.js'].lineData[460]++;
      n = visit55_460_1(n && n.toLowerCase());
      _$jscoverage['/control.js'].lineData[462]++;
      if (visit56_462_1(visit57_462_2(n !== 'input') && visit58_462_3(visit59_462_4(n !== 'textarea') && visit60_462_5(n !== 'button')))) {
        _$jscoverage['/control.js'].lineData[463]++;
        ev.preventDefault();
      }
    }
  }
}, 
  handleMouseUp: function(ev) {
  _$jscoverage['/control.js'].functionData[23]++;
  _$jscoverage['/control.js'].lineData[470]++;
  if (visit61_470_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[471]++;
    this.handleMouseUpInternal(ev);
  }
}, 
  handleMouseUpInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[24]++;
  _$jscoverage['/control.js'].lineData[483]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[485]++;
  if (visit62_485_1(self.get('active') && (visit63_485_2(visit64_485_3(ev.which === 1) || isTouchGestureSupported)))) {
    _$jscoverage['/control.js'].lineData[486]++;
    self.set('active', false);
  }
}, 
  handleContextMenu: function(ev) {
  _$jscoverage['/control.js'].functionData[25]++;
  _$jscoverage['/control.js'].lineData[491]++;
  if (visit65_491_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[492]++;
    this.handleContextMenuInternal(ev);
  }
}, 
  handleContextMenuInternal: function() {
  _$jscoverage['/control.js'].functionData[26]++;
}, 
  handleFocus: function() {
  _$jscoverage['/control.js'].functionData[27]++;
  _$jscoverage['/control.js'].lineData[504]++;
  if (visit66_504_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[505]++;
    this.handleFocusInternal();
  }
}, 
  handleFocusInternal: function() {
  _$jscoverage['/control.js'].functionData[28]++;
  _$jscoverage['/control.js'].lineData[514]++;
  this.focus();
  _$jscoverage['/control.js'].lineData[515]++;
  this.fire('focus');
}, 
  handleBlur: function() {
  _$jscoverage['/control.js'].functionData[29]++;
  _$jscoverage['/control.js'].lineData[519]++;
  if (visit67_519_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[520]++;
    this.handleBlurInternal();
  }
}, 
  handleBlurInternal: function() {
  _$jscoverage['/control.js'].functionData[30]++;
  _$jscoverage['/control.js'].lineData[529]++;
  this.blur();
  _$jscoverage['/control.js'].lineData[530]++;
  this.fire('blur');
}, 
  handleKeydown: function(ev) {
  _$jscoverage['/control.js'].functionData[31]++;
  _$jscoverage['/control.js'].lineData[534]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[535]++;
  if (visit68_535_1(!this.get('disabled') && self.handleKeyDownInternal(ev))) {
    _$jscoverage['/control.js'].lineData[536]++;
    ev.halt();
    _$jscoverage['/control.js'].lineData[537]++;
    return true;
  }
  _$jscoverage['/control.js'].lineData[539]++;
  return undefined;
}, 
  handleKeyDownInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[32]++;
  _$jscoverage['/control.js'].lineData[548]++;
  if (visit69_548_1(ev.keyCode === Node.KeyCode.ENTER)) {
    _$jscoverage['/control.js'].lineData[549]++;
    return this.handleClickInternal(ev);
  }
  _$jscoverage['/control.js'].lineData[551]++;
  return undefined;
}, 
  handleClick: function(ev) {
  _$jscoverage['/control.js'].functionData[33]++;
  _$jscoverage['/control.js'].lineData[555]++;
  if (visit70_555_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[556]++;
    this.handleClickInternal(ev);
  }
}, 
  handleClickInternal: function() {
  _$jscoverage['/control.js'].functionData[34]++;
  _$jscoverage['/control.js'].lineData[566]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[567]++;
  if (visit71_567_1(self.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[568]++;
    self.focus();
  }
}, 
  $: function(selector) {
  _$jscoverage['/control.js'].functionData[35]++;
  _$jscoverage['/control.js'].lineData[573]++;
  return this.$el.all(selector);
}, 
  fillChildrenElsBySelectors: function(childrenElSelectors) {
  _$jscoverage['/control.js'].functionData[36]++;
  _$jscoverage['/control.js'].lineData[577]++;
  var self = this, el = self.$el, childName, selector;
  _$jscoverage['/control.js'].lineData[581]++;
  childrenElSelectors = visit72_581_1(childrenElSelectors || self.childrenElSelectors);
  _$jscoverage['/control.js'].lineData[583]++;
  for (childName in childrenElSelectors) {
    _$jscoverage['/control.js'].lineData[584]++;
    selector = childrenElSelectors[childName];
    _$jscoverage['/control.js'].lineData[585]++;
    var node = selector.call(self, el);
    _$jscoverage['/control.js'].lineData[586]++;
    if (visit73_586_1(typeof node === 'string')) {
      _$jscoverage['/control.js'].lineData[587]++;
      node = self.$(node);
    }
    _$jscoverage['/control.js'].lineData[589]++;
    self.setInternal(childName, node);
  }
}, 
  renderTpl: function(tpl, renderData, renderCommands) {
  _$jscoverage['/control.js'].functionData[37]++;
  _$jscoverage['/control.js'].lineData[594]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[595]++;
  renderData = visit74_595_1(renderData || self.renderData);
  _$jscoverage['/control.js'].lineData[596]++;
  renderCommands = visit75_596_1(renderCommands || self.renderCommands);
  _$jscoverage['/control.js'].lineData[597]++;
  var XTemplate = self.get('XTemplate');
  _$jscoverage['/control.js'].lineData[598]++;
  return new XTemplate(tpl, {
  control: self, 
  commands: renderCommands}).render(renderData);
}, 
  getComponentConstructorByNode: function(prefixCls, childNode) {
  _$jscoverage['/control.js'].functionData[38]++;
  _$jscoverage['/control.js'].lineData[610]++;
  var cls = childNode[0].className;
  _$jscoverage['/control.js'].lineData[612]++;
  if (visit76_612_1(cls)) {
    _$jscoverage['/control.js'].lineData[613]++;
    cls = cls.replace(new RegExp('\\b' + prefixCls, 'ig'), '');
    _$jscoverage['/control.js'].lineData[614]++;
    return Manager.getConstructorByXClass(cls);
  }
  _$jscoverage['/control.js'].lineData[616]++;
  return null;
}, 
  getComponentCssClasses: function() {
  _$jscoverage['/control.js'].functionData[39]++;
  _$jscoverage['/control.js'].lineData[620]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[621]++;
  if (visit77_621_1(self.componentCssClasses)) {
    _$jscoverage['/control.js'].lineData[622]++;
    return self.componentCssClasses;
  }
  _$jscoverage['/control.js'].lineData[624]++;
  var constructor = self.constructor, xclass, re = [];
  _$jscoverage['/control.js'].lineData[627]++;
  while (visit78_627_1(constructor && !constructor.prototype.hasOwnProperty('isControl'))) {
    _$jscoverage['/control.js'].lineData[628]++;
    xclass = constructor.xclass;
    _$jscoverage['/control.js'].lineData[629]++;
    if (visit79_629_1(xclass)) {
      _$jscoverage['/control.js'].lineData[630]++;
      re.push(xclass);
    }
    _$jscoverage['/control.js'].lineData[632]++;
    constructor = visit80_632_1(constructor.superclass && constructor.superclass.constructor);
  }
  _$jscoverage['/control.js'].lineData[634]++;
  self.componentCssClasses = re;
  _$jscoverage['/control.js'].lineData[635]++;
  return re;
}, 
  getBaseCssClasses: function(extras) {
  _$jscoverage['/control.js'].functionData[40]++;
  _$jscoverage['/control.js'].lineData[644]++;
  extras = normalExtras(extras);
  _$jscoverage['/control.js'].lineData[645]++;
  var componentCssClasses = this.getComponentCssClasses(), i = 0, cls = '', l = componentCssClasses.length, prefixCls = this.get('prefixCls');
  _$jscoverage['/control.js'].lineData[650]++;
  for (; visit81_650_1(i < l); i++) {
    _$jscoverage['/control.js'].lineData[651]++;
    cls += prefixExtra(prefixCls, componentCssClasses[i], extras);
  }
  _$jscoverage['/control.js'].lineData[653]++;
  return trim(cls);
}, 
  getBaseCssClass: function(extras) {
  _$jscoverage['/control.js'].functionData[41]++;
  _$jscoverage['/control.js'].lineData[663]++;
  return trim(prefixExtra(this.get('prefixCls'), this.getComponentCssClasses()[0], normalExtras(extras)));
}, 
  createComponent: function(cfg, parent) {
  _$jscoverage['/control.js'].functionData[42]++;
  _$jscoverage['/control.js'].lineData[670]++;
  return Manager.createComponent(cfg, visit82_670_1(parent || this));
}, 
  show: function() {
  _$jscoverage['/control.js'].functionData[43]++;
  _$jscoverage['/control.js'].lineData[678]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[679]++;
  self.render();
  _$jscoverage['/control.js'].lineData[680]++;
  self.set('visible', true);
  _$jscoverage['/control.js'].lineData[681]++;
  return self;
}, 
  hide: function() {
  _$jscoverage['/control.js'].functionData[44]++;
  _$jscoverage['/control.js'].lineData[689]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[690]++;
  self.set('visible', false);
  _$jscoverage['/control.js'].lineData[691]++;
  return self;
}, 
  focus: function() {
  _$jscoverage['/control.js'].functionData[45]++;
  _$jscoverage['/control.js'].lineData[695]++;
  if (visit83_695_1(this.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[696]++;
    this.set('focused', true);
  }
}, 
  blur: function() {
  _$jscoverage['/control.js'].functionData[46]++;
  _$jscoverage['/control.js'].lineData[701]++;
  if (visit84_701_1(this.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[702]++;
    this.set('focused', false);
  }
}, 
  move: function(x, y) {
  _$jscoverage['/control.js'].functionData[47]++;
  _$jscoverage['/control.js'].lineData[707]++;
  this.set({
  x: x, 
  y: y});
}, 
  _onSetWidth: function(w) {
  _$jscoverage['/control.js'].functionData[48]++;
  _$jscoverage['/control.js'].lineData[714]++;
  this.$el.width(w);
}, 
  _onSetHeight: function(h) {
  _$jscoverage['/control.js'].functionData[49]++;
  _$jscoverage['/control.js'].lineData[718]++;
  this.$el.height(h);
}, 
  _onSetContent: function(c) {
  _$jscoverage['/control.js'].functionData[50]++;
  _$jscoverage['/control.js'].lineData[722]++;
  var el = this.$el;
  _$jscoverage['/control.js'].lineData[723]++;
  el.html(c);
  _$jscoverage['/control.js'].lineData[725]++;
  if (visit85_725_1(!this.get('allowTextSelection'))) {
    _$jscoverage['/control.js'].lineData[726]++;
    el.unselectable();
  }
}, 
  _onSetVisible: function(visible) {
  _$jscoverage['/control.js'].functionData[51]++;
  _$jscoverage['/control.js'].lineData[731]++;
  var self = this, el = self.$el, hiddenCls = self.getBaseCssClasses('hidden');
  _$jscoverage['/control.js'].lineData[734]++;
  if (visit86_734_1(visible)) {
    _$jscoverage['/control.js'].lineData[735]++;
    el.removeClass(hiddenCls);
  } else {
    _$jscoverage['/control.js'].lineData[737]++;
    el.addClass(hiddenCls);
  }
  _$jscoverage['/control.js'].lineData[740]++;
  this.fire(visible ? 'show' : 'hide');
}, 
  _onSetHighlighted: function(v) {
  _$jscoverage['/control.js'].functionData[52]++;
  _$jscoverage['/control.js'].lineData[747]++;
  var self = this, componentCls = self.getBaseCssClasses('hover'), el = self.$el;
  _$jscoverage['/control.js'].lineData[750]++;
  el[v ? 'addClass' : 'removeClass'](componentCls);
}, 
  _onSetDisabled: function(v) {
  _$jscoverage['/control.js'].functionData[53]++;
  _$jscoverage['/control.js'].lineData[757]++;
  var self = this, componentCls = self.getBaseCssClasses('disabled'), el = self.$el;
  _$jscoverage['/control.js'].lineData[761]++;
  el[v ? 'addClass' : 'removeClass'](componentCls).attr('aria-disabled', v);
  _$jscoverage['/control.js'].lineData[762]++;
  if (visit87_762_1(self.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[764]++;
    self.getKeyEventTarget().attr('tabindex', v ? -1 : 0);
  }
}, 
  _onSetActive: function(v) {
  _$jscoverage['/control.js'].functionData[54]++;
  _$jscoverage['/control.js'].lineData[771]++;
  var self = this, componentCls = self.getBaseCssClasses('active');
  _$jscoverage['/control.js'].lineData[774]++;
  self.$el[v ? 'addClass' : 'removeClass'](componentCls).attr('aria-pressed', !!v);
}, 
  _onSetZIndex: function(v) {
  _$jscoverage['/control.js'].functionData[55]++;
  _$jscoverage['/control.js'].lineData[778]++;
  this.$el.css('z-index', v);
}, 
  _onSetFocused: function(v) {
  _$jscoverage['/control.js'].functionData[56]++;
  _$jscoverage['/control.js'].lineData[782]++;
  var target = this.getKeyEventTarget()[0];
  _$jscoverage['/control.js'].lineData[783]++;
  if (visit88_783_1(v)) {
    _$jscoverage['/control.js'].lineData[784]++;
    try {
      _$jscoverage['/control.js'].lineData[785]++;
      target.focus();
    }    catch (e) {
  _$jscoverage['/control.js'].lineData[787]++;
  S.log(target);
  _$jscoverage['/control.js'].lineData[788]++;
  S.log('focus error', 'warn');
}
  } else {
    _$jscoverage['/control.js'].lineData[793]++;
    if (visit89_793_1(target.ownerDocument.activeElement === target)) {
      _$jscoverage['/control.js'].lineData[794]++;
      target.ownerDocument.body.focus();
    }
  }
  _$jscoverage['/control.js'].lineData[797]++;
  var self = this, el = self.$el, componentCls = self.getBaseCssClasses('focused');
  _$jscoverage['/control.js'].lineData[800]++;
  el[v ? 'addClass' : 'removeClass'](componentCls);
}, 
  _onSetX: function(x) {
  _$jscoverage['/control.js'].functionData[57]++;
  _$jscoverage['/control.js'].lineData[804]++;
  this.$el.offset({
  left: x});
}, 
  _onSetY: function(y) {
  _$jscoverage['/control.js'].functionData[58]++;
  _$jscoverage['/control.js'].lineData[810]++;
  this.$el.offset({
  top: y});
}, 
  destructor: function(destroy) {
  _$jscoverage['/control.js'].functionData[59]++;
  _$jscoverage['/control.js'].lineData[819]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[821]++;
  Manager.removeComponent(self);
  _$jscoverage['/control.js'].lineData[822]++;
  if (visit90_822_1(visit91_822_2(destroy !== false) && self.$el)) {
    _$jscoverage['/control.js'].lineData[823]++;
    self.$el.remove();
  }
}}, {
  __hooks__: {
  beforeCreateDom: __getHook('__beforeCreateDom'), 
  createDom: __getHook('__createDom'), 
  decorateDom: __getHook('__decorateDom'), 
  renderUI: __getHook('__renderUI'), 
  bindUI: __getHook('__bindUI'), 
  syncUI: __getHook('__syncUI')}, 
  name: 'control', 
  ATTRS: {
  contentTpl: {
  value: function(scope, buffer) {
  _$jscoverage['/control.js'].functionData[60]++;
  _$jscoverage['/control.js'].lineData[842]++;
  return buffer.write(scope.get('content'));
}}, 
  content: {
  parse: function(el) {
  _$jscoverage['/control.js'].functionData[61]++;
  _$jscoverage['/control.js'].lineData[860]++;
  return el.html();
}, 
  render: 1, 
  sync: 0, 
  value: ''}, 
  width: {
  render: 1, 
  sync: 0}, 
  height: {
  render: 1, 
  sync: 0}, 
  elCls: {
  render: 1, 
  valueFn: function() {
  _$jscoverage['/control.js'].functionData[62]++;
  _$jscoverage['/control.js'].lineData[911]++;
  return [];
}, 
  setter: function(v) {
  _$jscoverage['/control.js'].functionData[63]++;
  _$jscoverage['/control.js'].lineData[914]++;
  if (visit92_914_1(typeof v === 'string')) {
    _$jscoverage['/control.js'].lineData[915]++;
    v = v.split(/\s+/);
  }
  _$jscoverage['/control.js'].lineData[917]++;
  return visit93_917_1(v || []);
}}, 
  elStyle: {
  render: 1, 
  valueFn: function() {
  _$jscoverage['/control.js'].functionData[64]++;
  _$jscoverage['/control.js'].lineData[931]++;
  return {};
}}, 
  elAttrs: {
  render: 1, 
  valueFn: function() {
  _$jscoverage['/control.js'].functionData[65]++;
  _$jscoverage['/control.js'].lineData[945]++;
  return {};
}}, 
  x: {}, 
  y: {}, 
  xy: {
  setter: function(v) {
  _$jscoverage['/control.js'].functionData[66]++;
  _$jscoverage['/control.js'].lineData[989]++;
  var self = this, xy = S.makeArray(v);
  _$jscoverage['/control.js'].lineData[991]++;
  if (visit94_991_1(xy.length)) {
    _$jscoverage['/control.js'].lineData[992]++;
    if (visit95_992_1(xy[0] !== undefined)) {
      _$jscoverage['/control.js'].lineData[993]++;
      self.set('x', xy[0]);
    }
    _$jscoverage['/control.js'].lineData[995]++;
    if (visit96_995_1(xy[1] !== undefined)) {
      _$jscoverage['/control.js'].lineData[996]++;
      self.set('y', xy[1]);
    }
  }
  _$jscoverage['/control.js'].lineData[999]++;
  return v;
}, 
  getter: function() {
  _$jscoverage['/control.js'].functionData[67]++;
  _$jscoverage['/control.js'].lineData[1002]++;
  return [this.get('x'), this.get('y')];
}}, 
  zIndex: {
  render: 1, 
  sync: 0}, 
  visible: {
  render: 1, 
  sync: 0, 
  value: true}, 
  activeable: {
  value: true}, 
  focused: {}, 
  active: {
  value: false}, 
  highlighted: {
  render: 1, 
  sync: 0, 
  value: false}, 
  disabled: {
  render: 1, 
  sync: 0, 
  value: false, 
  parse: function(el) {
  _$jscoverage['/control.js'].functionData[68]++;
  _$jscoverage['/control.js'].lineData[1120]++;
  return el.hasClass(this.getBaseCssClass('disabled'));
}}, 
  rendered: {
  value: false}, 
  created: {
  value: false}, 
  render: {}, 
  id: {
  render: 1, 
  parse: function(el) {
  _$jscoverage['/control.js'].functionData[69]++;
  _$jscoverage['/control.js'].lineData[1167]++;
  var id = el.attr('id');
  _$jscoverage['/control.js'].lineData[1168]++;
  if (visit97_1168_1(!id)) {
    _$jscoverage['/control.js'].lineData[1169]++;
    id = S.guid('ks-component');
    _$jscoverage['/control.js'].lineData[1170]++;
    el.attr('id', id);
  }
  _$jscoverage['/control.js'].lineData[1172]++;
  return id;
}, 
  valueFn: function() {
  _$jscoverage['/control.js'].functionData[70]++;
  _$jscoverage['/control.js'].lineData[1175]++;
  return S.guid('ks-component');
}}, 
  elBefore: {}, 
  el: {
  getter: function() {
  _$jscoverage['/control.js'].functionData[71]++;
  _$jscoverage['/control.js'].lineData[1200]++;
  return this.$el;
}}, 
  srcNode: {
  setter: function(v) {
  _$jscoverage['/control.js'].functionData[72]++;
  _$jscoverage['/control.js'].lineData[1215]++;
  return $(v);
}}, 
  handleGestureEvents: {
  value: true}, 
  focusable: {
  value: true}, 
  allowTextSelection: {
  value: false}, 
  prefixCls: {
  render: 1, 
  value: visit98_1278_1(S.config('component/prefixCls') || 'ks-')}, 
  prefixXClass: {}, 
  parent: {
  setter: function(p, prev) {
  _$jscoverage['/control.js'].functionData[73]++;
  _$jscoverage['/control.js'].lineData[1306]++;
  if ((prev = this.get('parent'))) {
    _$jscoverage['/control.js'].lineData[1307]++;
    this.removeTarget(prev);
  }
  _$jscoverage['/control.js'].lineData[1309]++;
  if (visit99_1309_1(p)) {
    _$jscoverage['/control.js'].lineData[1310]++;
    this.addTarget(p);
  }
}}, 
  XTemplate: {
  value: XTemplateRuntime}}});
  _$jscoverage['/control.js'].lineData[1340]++;
  Control.extend = function extend(extensions, px, sx) {
  _$jscoverage['/control.js'].functionData[74]++;
  _$jscoverage['/control.js'].lineData[1342]++;
  var args = S.makeArray(arguments), self = this, xclass, argsLen = args.length, last = args[argsLen - 1];
  _$jscoverage['/control.js'].lineData[1348]++;
  if (visit100_1348_1(last && (xclass = last.xclass))) {
    _$jscoverage['/control.js'].lineData[1349]++;
    last.name = xclass;
  }
  _$jscoverage['/control.js'].lineData[1352]++;
  var NewClass = Base.extend.apply(self, arguments);
  _$jscoverage['/control.js'].lineData[1354]++;
  NewClass.extend = extend;
  _$jscoverage['/control.js'].lineData[1356]++;
  if (visit101_1356_1(xclass)) {
    _$jscoverage['/control.js'].lineData[1357]++;
    Manager.setConstructorByXClass(xclass, NewClass);
  }
  _$jscoverage['/control.js'].lineData[1360]++;
  return NewClass;
};
  _$jscoverage['/control.js'].lineData[1363]++;
  Control.Manager = Manager;
  _$jscoverage['/control.js'].lineData[1365]++;
  return Control;
});
