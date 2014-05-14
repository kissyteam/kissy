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
  _$jscoverage['/control.js'].lineData[24] = 0;
  _$jscoverage['/control.js'].lineData[26] = 0;
  _$jscoverage['/control.js'].lineData[27] = 0;
  _$jscoverage['/control.js'].lineData[28] = 0;
  _$jscoverage['/control.js'].lineData[30] = 0;
  _$jscoverage['/control.js'].lineData[31] = 0;
  _$jscoverage['/control.js'].lineData[33] = 0;
  _$jscoverage['/control.js'].lineData[36] = 0;
  _$jscoverage['/control.js'].lineData[37] = 0;
  _$jscoverage['/control.js'].lineData[42] = 0;
  _$jscoverage['/control.js'].lineData[43] = 0;
  _$jscoverage['/control.js'].lineData[44] = 0;
  _$jscoverage['/control.js'].lineData[45] = 0;
  _$jscoverage['/control.js'].lineData[47] = 0;
  _$jscoverage['/control.js'].lineData[50] = 0;
  _$jscoverage['/control.js'].lineData[51] = 0;
  _$jscoverage['/control.js'].lineData[52] = 0;
  _$jscoverage['/control.js'].lineData[54] = 0;
  _$jscoverage['/control.js'].lineData[57] = 0;
  _$jscoverage['/control.js'].lineData[58] = 0;
  _$jscoverage['/control.js'].lineData[61] = 0;
  _$jscoverage['/control.js'].lineData[65] = 0;
  _$jscoverage['/control.js'].lineData[66] = 0;
  _$jscoverage['/control.js'].lineData[68] = 0;
  _$jscoverage['/control.js'].lineData[70] = 0;
  _$jscoverage['/control.js'].lineData[71] = 0;
  _$jscoverage['/control.js'].lineData[72] = 0;
  _$jscoverage['/control.js'].lineData[79] = 0;
  _$jscoverage['/control.js'].lineData[80] = 0;
  _$jscoverage['/control.js'].lineData[83] = 0;
  _$jscoverage['/control.js'].lineData[84] = 0;
  _$jscoverage['/control.js'].lineData[92] = 0;
  _$jscoverage['/control.js'].lineData[112] = 0;
  _$jscoverage['/control.js'].lineData[113] = 0;
  _$jscoverage['/control.js'].lineData[114] = 0;
  _$jscoverage['/control.js'].lineData[115] = 0;
  _$jscoverage['/control.js'].lineData[116] = 0;
  _$jscoverage['/control.js'].lineData[117] = 0;
  _$jscoverage['/control.js'].lineData[121] = 0;
  _$jscoverage['/control.js'].lineData[122] = 0;
  _$jscoverage['/control.js'].lineData[124] = 0;
  _$jscoverage['/control.js'].lineData[125] = 0;
  _$jscoverage['/control.js'].lineData[131] = 0;
  _$jscoverage['/control.js'].lineData[144] = 0;
  _$jscoverage['/control.js'].lineData[145] = 0;
  _$jscoverage['/control.js'].lineData[146] = 0;
  _$jscoverage['/control.js'].lineData[147] = 0;
  _$jscoverage['/control.js'].lineData[151] = 0;
  _$jscoverage['/control.js'].lineData[152] = 0;
  _$jscoverage['/control.js'].lineData[153] = 0;
  _$jscoverage['/control.js'].lineData[154] = 0;
  _$jscoverage['/control.js'].lineData[156] = 0;
  _$jscoverage['/control.js'].lineData[157] = 0;
  _$jscoverage['/control.js'].lineData[159] = 0;
  _$jscoverage['/control.js'].lineData[160] = 0;
  _$jscoverage['/control.js'].lineData[162] = 0;
  _$jscoverage['/control.js'].lineData[163] = 0;
  _$jscoverage['/control.js'].lineData[166] = 0;
  _$jscoverage['/control.js'].lineData[167] = 0;
  _$jscoverage['/control.js'].lineData[170] = 0;
  _$jscoverage['/control.js'].lineData[171] = 0;
  _$jscoverage['/control.js'].lineData[172] = 0;
  _$jscoverage['/control.js'].lineData[174] = 0;
  _$jscoverage['/control.js'].lineData[175] = 0;
  _$jscoverage['/control.js'].lineData[184] = 0;
  _$jscoverage['/control.js'].lineData[187] = 0;
  _$jscoverage['/control.js'].lineData[188] = 0;
  _$jscoverage['/control.js'].lineData[189] = 0;
  _$jscoverage['/control.js'].lineData[190] = 0;
  _$jscoverage['/control.js'].lineData[194] = 0;
  _$jscoverage['/control.js'].lineData[195] = 0;
  _$jscoverage['/control.js'].lineData[196] = 0;
  _$jscoverage['/control.js'].lineData[198] = 0;
  _$jscoverage['/control.js'].lineData[199] = 0;
  _$jscoverage['/control.js'].lineData[207] = 0;
  _$jscoverage['/control.js'].lineData[209] = 0;
  _$jscoverage['/control.js'].lineData[210] = 0;
  _$jscoverage['/control.js'].lineData[211] = 0;
  _$jscoverage['/control.js'].lineData[212] = 0;
  _$jscoverage['/control.js'].lineData[215] = 0;
  _$jscoverage['/control.js'].lineData[216] = 0;
  _$jscoverage['/control.js'].lineData[218] = 0;
  _$jscoverage['/control.js'].lineData[219] = 0;
  _$jscoverage['/control.js'].lineData[220] = 0;
  _$jscoverage['/control.js'].lineData[221] = 0;
  _$jscoverage['/control.js'].lineData[223] = 0;
  _$jscoverage['/control.js'].lineData[229] = 0;
  _$jscoverage['/control.js'].lineData[231] = 0;
  _$jscoverage['/control.js'].lineData[232] = 0;
  _$jscoverage['/control.js'].lineData[237] = 0;
  _$jscoverage['/control.js'].lineData[239] = 0;
  _$jscoverage['/control.js'].lineData[240] = 0;
  _$jscoverage['/control.js'].lineData[242] = 0;
  _$jscoverage['/control.js'].lineData[245] = 0;
  _$jscoverage['/control.js'].lineData[253] = 0;
  _$jscoverage['/control.js'].lineData[265] = 0;
  _$jscoverage['/control.js'].lineData[266] = 0;
  _$jscoverage['/control.js'].lineData[272] = 0;
  _$jscoverage['/control.js'].lineData[273] = 0;
  _$jscoverage['/control.js'].lineData[275] = 0;
  _$jscoverage['/control.js'].lineData[276] = 0;
  _$jscoverage['/control.js'].lineData[279] = 0;
  _$jscoverage['/control.js'].lineData[281] = 0;
  _$jscoverage['/control.js'].lineData[282] = 0;
  _$jscoverage['/control.js'].lineData[284] = 0;
  _$jscoverage['/control.js'].lineData[290] = 0;
  _$jscoverage['/control.js'].lineData[291] = 0;
  _$jscoverage['/control.js'].lineData[293] = 0;
  _$jscoverage['/control.js'].lineData[301] = 0;
  _$jscoverage['/control.js'].lineData[303] = 0;
  _$jscoverage['/control.js'].lineData[304] = 0;
  _$jscoverage['/control.js'].lineData[312] = 0;
  _$jscoverage['/control.js'].lineData[313] = 0;
  _$jscoverage['/control.js'].lineData[314] = 0;
  _$jscoverage['/control.js'].lineData[321] = 0;
  _$jscoverage['/control.js'].lineData[329] = 0;
  _$jscoverage['/control.js'].lineData[330] = 0;
  _$jscoverage['/control.js'].lineData[331] = 0;
  _$jscoverage['/control.js'].lineData[332] = 0;
  _$jscoverage['/control.js'].lineData[338] = 0;
  _$jscoverage['/control.js'].lineData[345] = 0;
  _$jscoverage['/control.js'].lineData[346] = 0;
  _$jscoverage['/control.js'].lineData[347] = 0;
  _$jscoverage['/control.js'].lineData[348] = 0;
  _$jscoverage['/control.js'].lineData[354] = 0;
  _$jscoverage['/control.js'].lineData[356] = 0;
  _$jscoverage['/control.js'].lineData[358] = 0;
  _$jscoverage['/control.js'].lineData[362] = 0;
  _$jscoverage['/control.js'].lineData[365] = 0;
  _$jscoverage['/control.js'].lineData[366] = 0;
  _$jscoverage['/control.js'].lineData[367] = 0;
  _$jscoverage['/control.js'].lineData[369] = 0;
  _$jscoverage['/control.js'].lineData[370] = 0;
  _$jscoverage['/control.js'].lineData[372] = 0;
  _$jscoverage['/control.js'].lineData[373] = 0;
  _$jscoverage['/control.js'].lineData[375] = 0;
  _$jscoverage['/control.js'].lineData[376] = 0;
  _$jscoverage['/control.js'].lineData[378] = 0;
  _$jscoverage['/control.js'].lineData[379] = 0;
  _$jscoverage['/control.js'].lineData[381] = 0;
  _$jscoverage['/control.js'].lineData[382] = 0;
  _$jscoverage['/control.js'].lineData[383] = 0;
  _$jscoverage['/control.js'].lineData[386] = 0;
  _$jscoverage['/control.js'].lineData[395] = 0;
  _$jscoverage['/control.js'].lineData[399] = 0;
  _$jscoverage['/control.js'].lineData[400] = 0;
  _$jscoverage['/control.js'].lineData[410] = 0;
  _$jscoverage['/control.js'].lineData[414] = 0;
  _$jscoverage['/control.js'].lineData[415] = 0;
  _$jscoverage['/control.js'].lineData[425] = 0;
  _$jscoverage['/control.js'].lineData[426] = 0;
  _$jscoverage['/control.js'].lineData[427] = 0;
  _$jscoverage['/control.js'].lineData[431] = 0;
  _$jscoverage['/control.js'].lineData[432] = 0;
  _$jscoverage['/control.js'].lineData[445] = 0;
  _$jscoverage['/control.js'].lineData[448] = 0;
  _$jscoverage['/control.js'].lineData[449] = 0;
  _$jscoverage['/control.js'].lineData[450] = 0;
  _$jscoverage['/control.js'].lineData[452] = 0;
  _$jscoverage['/control.js'].lineData[453] = 0;
  _$jscoverage['/control.js'].lineData[457] = 0;
  _$jscoverage['/control.js'].lineData[460] = 0;
  _$jscoverage['/control.js'].lineData[461] = 0;
  _$jscoverage['/control.js'].lineData[463] = 0;
  _$jscoverage['/control.js'].lineData[464] = 0;
  _$jscoverage['/control.js'].lineData[471] = 0;
  _$jscoverage['/control.js'].lineData[472] = 0;
  _$jscoverage['/control.js'].lineData[484] = 0;
  _$jscoverage['/control.js'].lineData[486] = 0;
  _$jscoverage['/control.js'].lineData[487] = 0;
  _$jscoverage['/control.js'].lineData[492] = 0;
  _$jscoverage['/control.js'].lineData[493] = 0;
  _$jscoverage['/control.js'].lineData[505] = 0;
  _$jscoverage['/control.js'].lineData[506] = 0;
  _$jscoverage['/control.js'].lineData[515] = 0;
  _$jscoverage['/control.js'].lineData[516] = 0;
  _$jscoverage['/control.js'].lineData[520] = 0;
  _$jscoverage['/control.js'].lineData[521] = 0;
  _$jscoverage['/control.js'].lineData[530] = 0;
  _$jscoverage['/control.js'].lineData[531] = 0;
  _$jscoverage['/control.js'].lineData[535] = 0;
  _$jscoverage['/control.js'].lineData[536] = 0;
  _$jscoverage['/control.js'].lineData[537] = 0;
  _$jscoverage['/control.js'].lineData[538] = 0;
  _$jscoverage['/control.js'].lineData[540] = 0;
  _$jscoverage['/control.js'].lineData[549] = 0;
  _$jscoverage['/control.js'].lineData[550] = 0;
  _$jscoverage['/control.js'].lineData[552] = 0;
  _$jscoverage['/control.js'].lineData[556] = 0;
  _$jscoverage['/control.js'].lineData[557] = 0;
  _$jscoverage['/control.js'].lineData[567] = 0;
  _$jscoverage['/control.js'].lineData[568] = 0;
  _$jscoverage['/control.js'].lineData[569] = 0;
  _$jscoverage['/control.js'].lineData[574] = 0;
  _$jscoverage['/control.js'].lineData[578] = 0;
  _$jscoverage['/control.js'].lineData[582] = 0;
  _$jscoverage['/control.js'].lineData[584] = 0;
  _$jscoverage['/control.js'].lineData[585] = 0;
  _$jscoverage['/control.js'].lineData[586] = 0;
  _$jscoverage['/control.js'].lineData[587] = 0;
  _$jscoverage['/control.js'].lineData[588] = 0;
  _$jscoverage['/control.js'].lineData[590] = 0;
  _$jscoverage['/control.js'].lineData[595] = 0;
  _$jscoverage['/control.js'].lineData[596] = 0;
  _$jscoverage['/control.js'].lineData[597] = 0;
  _$jscoverage['/control.js'].lineData[598] = 0;
  _$jscoverage['/control.js'].lineData[599] = 0;
  _$jscoverage['/control.js'].lineData[611] = 0;
  _$jscoverage['/control.js'].lineData[613] = 0;
  _$jscoverage['/control.js'].lineData[614] = 0;
  _$jscoverage['/control.js'].lineData[615] = 0;
  _$jscoverage['/control.js'].lineData[617] = 0;
  _$jscoverage['/control.js'].lineData[621] = 0;
  _$jscoverage['/control.js'].lineData[622] = 0;
  _$jscoverage['/control.js'].lineData[623] = 0;
  _$jscoverage['/control.js'].lineData[625] = 0;
  _$jscoverage['/control.js'].lineData[628] = 0;
  _$jscoverage['/control.js'].lineData[629] = 0;
  _$jscoverage['/control.js'].lineData[630] = 0;
  _$jscoverage['/control.js'].lineData[631] = 0;
  _$jscoverage['/control.js'].lineData[633] = 0;
  _$jscoverage['/control.js'].lineData[635] = 0;
  _$jscoverage['/control.js'].lineData[636] = 0;
  _$jscoverage['/control.js'].lineData[645] = 0;
  _$jscoverage['/control.js'].lineData[646] = 0;
  _$jscoverage['/control.js'].lineData[651] = 0;
  _$jscoverage['/control.js'].lineData[652] = 0;
  _$jscoverage['/control.js'].lineData[654] = 0;
  _$jscoverage['/control.js'].lineData[664] = 0;
  _$jscoverage['/control.js'].lineData[671] = 0;
  _$jscoverage['/control.js'].lineData[679] = 0;
  _$jscoverage['/control.js'].lineData[680] = 0;
  _$jscoverage['/control.js'].lineData[681] = 0;
  _$jscoverage['/control.js'].lineData[682] = 0;
  _$jscoverage['/control.js'].lineData[690] = 0;
  _$jscoverage['/control.js'].lineData[691] = 0;
  _$jscoverage['/control.js'].lineData[692] = 0;
  _$jscoverage['/control.js'].lineData[696] = 0;
  _$jscoverage['/control.js'].lineData[697] = 0;
  _$jscoverage['/control.js'].lineData[702] = 0;
  _$jscoverage['/control.js'].lineData[703] = 0;
  _$jscoverage['/control.js'].lineData[708] = 0;
  _$jscoverage['/control.js'].lineData[715] = 0;
  _$jscoverage['/control.js'].lineData[719] = 0;
  _$jscoverage['/control.js'].lineData[723] = 0;
  _$jscoverage['/control.js'].lineData[724] = 0;
  _$jscoverage['/control.js'].lineData[726] = 0;
  _$jscoverage['/control.js'].lineData[727] = 0;
  _$jscoverage['/control.js'].lineData[732] = 0;
  _$jscoverage['/control.js'].lineData[735] = 0;
  _$jscoverage['/control.js'].lineData[736] = 0;
  _$jscoverage['/control.js'].lineData[738] = 0;
  _$jscoverage['/control.js'].lineData[741] = 0;
  _$jscoverage['/control.js'].lineData[748] = 0;
  _$jscoverage['/control.js'].lineData[751] = 0;
  _$jscoverage['/control.js'].lineData[758] = 0;
  _$jscoverage['/control.js'].lineData[762] = 0;
  _$jscoverage['/control.js'].lineData[763] = 0;
  _$jscoverage['/control.js'].lineData[765] = 0;
  _$jscoverage['/control.js'].lineData[772] = 0;
  _$jscoverage['/control.js'].lineData[775] = 0;
  _$jscoverage['/control.js'].lineData[779] = 0;
  _$jscoverage['/control.js'].lineData[783] = 0;
  _$jscoverage['/control.js'].lineData[784] = 0;
  _$jscoverage['/control.js'].lineData[785] = 0;
  _$jscoverage['/control.js'].lineData[786] = 0;
  _$jscoverage['/control.js'].lineData[788] = 0;
  _$jscoverage['/control.js'].lineData[789] = 0;
  _$jscoverage['/control.js'].lineData[794] = 0;
  _$jscoverage['/control.js'].lineData[795] = 0;
  _$jscoverage['/control.js'].lineData[798] = 0;
  _$jscoverage['/control.js'].lineData[801] = 0;
  _$jscoverage['/control.js'].lineData[805] = 0;
  _$jscoverage['/control.js'].lineData[811] = 0;
  _$jscoverage['/control.js'].lineData[820] = 0;
  _$jscoverage['/control.js'].lineData[822] = 0;
  _$jscoverage['/control.js'].lineData[823] = 0;
  _$jscoverage['/control.js'].lineData[824] = 0;
  _$jscoverage['/control.js'].lineData[843] = 0;
  _$jscoverage['/control.js'].lineData[861] = 0;
  _$jscoverage['/control.js'].lineData[912] = 0;
  _$jscoverage['/control.js'].lineData[915] = 0;
  _$jscoverage['/control.js'].lineData[916] = 0;
  _$jscoverage['/control.js'].lineData[918] = 0;
  _$jscoverage['/control.js'].lineData[932] = 0;
  _$jscoverage['/control.js'].lineData[946] = 0;
  _$jscoverage['/control.js'].lineData[990] = 0;
  _$jscoverage['/control.js'].lineData[992] = 0;
  _$jscoverage['/control.js'].lineData[993] = 0;
  _$jscoverage['/control.js'].lineData[994] = 0;
  _$jscoverage['/control.js'].lineData[996] = 0;
  _$jscoverage['/control.js'].lineData[997] = 0;
  _$jscoverage['/control.js'].lineData[1000] = 0;
  _$jscoverage['/control.js'].lineData[1003] = 0;
  _$jscoverage['/control.js'].lineData[1121] = 0;
  _$jscoverage['/control.js'].lineData[1168] = 0;
  _$jscoverage['/control.js'].lineData[1169] = 0;
  _$jscoverage['/control.js'].lineData[1170] = 0;
  _$jscoverage['/control.js'].lineData[1171] = 0;
  _$jscoverage['/control.js'].lineData[1173] = 0;
  _$jscoverage['/control.js'].lineData[1176] = 0;
  _$jscoverage['/control.js'].lineData[1201] = 0;
  _$jscoverage['/control.js'].lineData[1216] = 0;
  _$jscoverage['/control.js'].lineData[1307] = 0;
  _$jscoverage['/control.js'].lineData[1308] = 0;
  _$jscoverage['/control.js'].lineData[1310] = 0;
  _$jscoverage['/control.js'].lineData[1311] = 0;
  _$jscoverage['/control.js'].lineData[1341] = 0;
  _$jscoverage['/control.js'].lineData[1343] = 0;
  _$jscoverage['/control.js'].lineData[1349] = 0;
  _$jscoverage['/control.js'].lineData[1350] = 0;
  _$jscoverage['/control.js'].lineData[1353] = 0;
  _$jscoverage['/control.js'].lineData[1355] = 0;
  _$jscoverage['/control.js'].lineData[1357] = 0;
  _$jscoverage['/control.js'].lineData[1358] = 0;
  _$jscoverage['/control.js'].lineData[1361] = 0;
  _$jscoverage['/control.js'].lineData[1364] = 0;
  _$jscoverage['/control.js'].lineData[1366] = 0;
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
  _$jscoverage['/control.js'].branchData['27'] = [];
  _$jscoverage['/control.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['30'] = [];
  _$jscoverage['/control.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['42'] = [];
  _$jscoverage['/control.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['51'] = [];
  _$jscoverage['/control.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['68'] = [];
  _$jscoverage['/control.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['71'] = [];
  _$jscoverage['/control.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['80'] = [];
  _$jscoverage['/control.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['80'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['124'] = [];
  _$jscoverage['/control.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['146'] = [];
  _$jscoverage['/control.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['156'] = [];
  _$jscoverage['/control.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['159'] = [];
  _$jscoverage['/control.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['162'] = [];
  _$jscoverage['/control.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['166'] = [];
  _$jscoverage['/control.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['174'] = [];
  _$jscoverage['/control.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['211'] = [];
  _$jscoverage['/control.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['215'] = [];
  _$jscoverage['/control.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['218'] = [];
  _$jscoverage['/control.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['220'] = [];
  _$jscoverage['/control.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['231'] = [];
  _$jscoverage['/control.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['239'] = [];
  _$jscoverage['/control.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['245'] = [];
  _$jscoverage['/control.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['266'] = [];
  _$jscoverage['/control.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['275'] = [];
  _$jscoverage['/control.js'].branchData['275'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['281'] = [];
  _$jscoverage['/control.js'].branchData['281'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['303'] = [];
  _$jscoverage['/control.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['367'] = [];
  _$jscoverage['/control.js'].branchData['367'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['369'] = [];
  _$jscoverage['/control.js'].branchData['369'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['372'] = [];
  _$jscoverage['/control.js'].branchData['372'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['375'] = [];
  _$jscoverage['/control.js'].branchData['375'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['378'] = [];
  _$jscoverage['/control.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['381'] = [];
  _$jscoverage['/control.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['382'] = [];
  _$jscoverage['/control.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['399'] = [];
  _$jscoverage['/control.js'].branchData['399'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['414'] = [];
  _$jscoverage['/control.js'].branchData['414'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['431'] = [];
  _$jscoverage['/control.js'].branchData['431'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['447'] = [];
  _$jscoverage['/control.js'].branchData['447'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['448'] = [];
  _$jscoverage['/control.js'].branchData['448'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['449'] = [];
  _$jscoverage['/control.js'].branchData['449'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['452'] = [];
  _$jscoverage['/control.js'].branchData['452'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['457'] = [];
  _$jscoverage['/control.js'].branchData['457'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['457'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['461'] = [];
  _$jscoverage['/control.js'].branchData['461'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['463'] = [];
  _$jscoverage['/control.js'].branchData['463'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['463'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['463'][3] = new BranchData();
  _$jscoverage['/control.js'].branchData['463'][4] = new BranchData();
  _$jscoverage['/control.js'].branchData['463'][5] = new BranchData();
  _$jscoverage['/control.js'].branchData['471'] = [];
  _$jscoverage['/control.js'].branchData['471'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['486'] = [];
  _$jscoverage['/control.js'].branchData['486'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['486'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['486'][3] = new BranchData();
  _$jscoverage['/control.js'].branchData['492'] = [];
  _$jscoverage['/control.js'].branchData['492'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['505'] = [];
  _$jscoverage['/control.js'].branchData['505'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['520'] = [];
  _$jscoverage['/control.js'].branchData['520'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['536'] = [];
  _$jscoverage['/control.js'].branchData['536'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['549'] = [];
  _$jscoverage['/control.js'].branchData['549'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['556'] = [];
  _$jscoverage['/control.js'].branchData['556'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['568'] = [];
  _$jscoverage['/control.js'].branchData['568'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['582'] = [];
  _$jscoverage['/control.js'].branchData['582'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['587'] = [];
  _$jscoverage['/control.js'].branchData['587'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['596'] = [];
  _$jscoverage['/control.js'].branchData['596'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['597'] = [];
  _$jscoverage['/control.js'].branchData['597'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['613'] = [];
  _$jscoverage['/control.js'].branchData['613'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['622'] = [];
  _$jscoverage['/control.js'].branchData['622'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['628'] = [];
  _$jscoverage['/control.js'].branchData['628'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['630'] = [];
  _$jscoverage['/control.js'].branchData['630'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['633'] = [];
  _$jscoverage['/control.js'].branchData['633'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['651'] = [];
  _$jscoverage['/control.js'].branchData['651'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['671'] = [];
  _$jscoverage['/control.js'].branchData['671'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['696'] = [];
  _$jscoverage['/control.js'].branchData['696'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['702'] = [];
  _$jscoverage['/control.js'].branchData['702'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['726'] = [];
  _$jscoverage['/control.js'].branchData['726'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['735'] = [];
  _$jscoverage['/control.js'].branchData['735'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['763'] = [];
  _$jscoverage['/control.js'].branchData['763'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['784'] = [];
  _$jscoverage['/control.js'].branchData['784'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['794'] = [];
  _$jscoverage['/control.js'].branchData['794'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['823'] = [];
  _$jscoverage['/control.js'].branchData['823'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['823'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['915'] = [];
  _$jscoverage['/control.js'].branchData['915'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['918'] = [];
  _$jscoverage['/control.js'].branchData['918'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['992'] = [];
  _$jscoverage['/control.js'].branchData['992'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['993'] = [];
  _$jscoverage['/control.js'].branchData['993'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['996'] = [];
  _$jscoverage['/control.js'].branchData['996'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['1169'] = [];
  _$jscoverage['/control.js'].branchData['1169'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['1279'] = [];
  _$jscoverage['/control.js'].branchData['1279'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['1310'] = [];
  _$jscoverage['/control.js'].branchData['1310'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['1349'] = [];
  _$jscoverage['/control.js'].branchData['1349'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['1357'] = [];
  _$jscoverage['/control.js'].branchData['1357'][1] = new BranchData();
}
_$jscoverage['/control.js'].branchData['1357'][1].init(411, 6, 'xclass');
function visit101_1357_1(result) {
  _$jscoverage['/control.js'].branchData['1357'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['1349'][1].init(219, 30, 'last && (xclass = last.xclass)');
function visit100_1349_1(result) {
  _$jscoverage['/control.js'].branchData['1349'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['1310'][1].init(171, 1, 'p');
function visit99_1310_1(result) {
  _$jscoverage['/control.js'].branchData['1310'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['1279'][1].init(61, 40, 'S.config(\'component/prefixCls\') || \'ks-\'');
function visit98_1279_1(result) {
  _$jscoverage['/control.js'].branchData['1279'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['1169'][1].init(79, 3, '!id');
function visit97_1169_1(result) {
  _$jscoverage['/control.js'].branchData['1169'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['996'][1].init(176, 19, 'xy[1] !== undefined');
function visit96_996_1(result) {
  _$jscoverage['/control.js'].branchData['996'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['993'][1].init(34, 19, 'xy[0] !== undefined');
function visit95_993_1(result) {
  _$jscoverage['/control.js'].branchData['993'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['992'][1].init(125, 9, 'xy.length');
function visit94_992_1(result) {
  _$jscoverage['/control.js'].branchData['992'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['918'][1].init(163, 7, 'v || []');
function visit93_918_1(result) {
  _$jscoverage['/control.js'].branchData['918'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['915'][1].init(30, 21, 'typeof v === \'string\'');
function visit92_915_1(result) {
  _$jscoverage['/control.js'].branchData['915'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['823'][2].init(153, 17, 'destroy !== false');
function visit91_823_2(result) {
  _$jscoverage['/control.js'].branchData['823'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['823'][1].init(153, 29, 'destroy !== false && self.$el');
function visit90_823_1(result) {
  _$jscoverage['/control.js'].branchData['823'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['794'][1].init(186, 45, 'target.ownerDocument.activeElement === target');
function visit89_794_1(result) {
  _$jscoverage['/control.js'].branchData['794'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['784'][1].init(81, 1, 'v');
function visit88_784_1(result) {
  _$jscoverage['/control.js'].branchData['784'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['763'][1].init(278, 21, 'self.get(\'focusable\')');
function visit87_763_1(result) {
  _$jscoverage['/control.js'].branchData['763'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['735'][1].init(159, 7, 'visible');
function visit86_735_1(result) {
  _$jscoverage['/control.js'].branchData['735'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['726'][1].init(158, 31, '!this.get(\'allowTextSelection\')');
function visit85_726_1(result) {
  _$jscoverage['/control.js'].branchData['726'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['702'][1].init(22, 21, 'this.get(\'focusable\')');
function visit84_702_1(result) {
  _$jscoverage['/control.js'].branchData['702'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['696'][1].init(22, 21, 'this.get(\'focusable\')');
function visit83_696_1(result) {
  _$jscoverage['/control.js'].branchData['696'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['671'][1].init(54, 14, 'parent || this');
function visit82_671_1(result) {
  _$jscoverage['/control.js'].branchData['671'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['651'][1].init(315, 5, 'i < l');
function visit81_651_1(result) {
  _$jscoverage['/control.js'].branchData['651'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['633'][1].init(186, 60, 'constructor.superclass && constructor.superclass.constructor');
function visit80_633_1(result) {
  _$jscoverage['/control.js'].branchData['633'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['630'][1].init(76, 6, 'xclass');
function visit79_630_1(result) {
  _$jscoverage['/control.js'].branchData['630'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['628'][1].init(293, 65, 'constructor && !constructor.prototype.hasOwnProperty(\'isControl\')');
function visit78_628_1(result) {
  _$jscoverage['/control.js'].branchData['628'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['622'][1].init(56, 24, 'self.componentCssClasses');
function visit77_622_1(result) {
  _$jscoverage['/control.js'].branchData['622'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['613'][1].init(101, 3, 'cls');
function visit76_613_1(result) {
  _$jscoverage['/control.js'].branchData['613'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['597'][1].init(130, 37, 'renderCommands || self.renderCommands');
function visit75_597_1(result) {
  _$jscoverage['/control.js'].branchData['597'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['596'][1].init(65, 29, 'renderData || self.renderData');
function visit74_596_1(result) {
  _$jscoverage['/control.js'].branchData['596'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['587'][1].init(147, 24, 'typeof node === \'string\'');
function visit73_587_1(result) {
  _$jscoverage['/control.js'].branchData['587'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['582'][1].init(154, 47, 'childrenElSelectors || self.childrenElSelectors');
function visit72_582_1(result) {
  _$jscoverage['/control.js'].branchData['582'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['568'][1].init(102, 21, 'self.get(\'focusable\')');
function visit71_568_1(result) {
  _$jscoverage['/control.js'].branchData['568'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['556'][1].init(22, 21, '!this.get(\'disabled\')');
function visit70_556_1(result) {
  _$jscoverage['/control.js'].branchData['556'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['549'][1].init(22, 33, 'ev.keyCode === Node.KeyCode.ENTER');
function visit69_549_1(result) {
  _$jscoverage['/control.js'].branchData['549'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['536'][1].init(56, 55, '!this.get(\'disabled\') && self.handleKeyDownInternal(ev)');
function visit68_536_1(result) {
  _$jscoverage['/control.js'].branchData['536'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['520'][1].init(22, 21, '!this.get(\'disabled\')');
function visit67_520_1(result) {
  _$jscoverage['/control.js'].branchData['520'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['505'][1].init(22, 21, '!this.get(\'disabled\')');
function visit66_505_1(result) {
  _$jscoverage['/control.js'].branchData['505'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['492'][1].init(22, 21, '!this.get(\'disabled\')');
function visit65_492_1(result) {
  _$jscoverage['/control.js'].branchData['492'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['486'][3].init(102, 14, 'ev.which === 1');
function visit64_486_3(result) {
  _$jscoverage['/control.js'].branchData['486'][3].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['486'][2].init(102, 41, 'ev.which === 1 || isTouchGestureSupported');
function visit63_486_2(result) {
  _$jscoverage['/control.js'].branchData['486'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['486'][1].init(79, 65, 'self.get(\'active\') && (ev.which === 1 || isTouchGestureSupported)');
function visit62_486_1(result) {
  _$jscoverage['/control.js'].branchData['486'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['471'][1].init(22, 21, '!this.get(\'disabled\')');
function visit61_471_1(result) {
  _$jscoverage['/control.js'].branchData['471'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['463'][5].init(360, 14, 'n !== \'button\'');
function visit60_463_5(result) {
  _$jscoverage['/control.js'].branchData['463'][5].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['463'][4].init(340, 16, 'n !== \'textarea\'');
function visit59_463_4(result) {
  _$jscoverage['/control.js'].branchData['463'][4].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['463'][3].init(340, 34, 'n !== \'textarea\' && n !== \'button\'');
function visit58_463_3(result) {
  _$jscoverage['/control.js'].branchData['463'][3].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['463'][2].init(323, 13, 'n !== \'input\'');
function visit57_463_2(result) {
  _$jscoverage['/control.js'].branchData['463'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['463'][1].init(323, 51, 'n !== \'input\' && n !== \'textarea\' && n !== \'button\'');
function visit56_463_1(result) {
  _$jscoverage['/control.js'].branchData['463'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['461'][1].init(192, 20, 'n && n.toLowerCase()');
function visit55_461_1(result) {
  _$jscoverage['/control.js'].branchData['461'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['457'][2].init(417, 26, 'ev.gestureType === \'mouse\'');
function visit54_457_2(result) {
  _$jscoverage['/control.js'].branchData['457'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['457'][1].init(382, 61, '!self.get(\'allowTextSelection\') && ev.gestureType === \'mouse\'');
function visit53_457_1(result) {
  _$jscoverage['/control.js'].branchData['457'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['452'][1].init(151, 21, 'self.get(\'focusable\')');
function visit52_452_1(result) {
  _$jscoverage['/control.js'].branchData['452'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['449'][1].init(26, 22, 'self.get(\'activeable\')');
function visit51_449_1(result) {
  _$jscoverage['/control.js'].branchData['449'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['448'][1].init(139, 46, 'isMouseActionButton || isTouchGestureSupported');
function visit50_448_1(result) {
  _$jscoverage['/control.js'].branchData['448'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['447'][1].init(83, 14, 'ev.which === 1');
function visit49_447_1(result) {
  _$jscoverage['/control.js'].branchData['447'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['431'][1].init(22, 21, '!this.get(\'disabled\')');
function visit48_431_1(result) {
  _$jscoverage['/control.js'].branchData['431'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['414'][1].init(22, 21, '!this.get(\'disabled\')');
function visit47_414_1(result) {
  _$jscoverage['/control.js'].branchData['414'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['399'][1].init(22, 21, '!this.get(\'disabled\')');
function visit46_399_1(result) {
  _$jscoverage['/control.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['382'][1].init(26, 17, 'p.pluginCreateDom');
function visit45_382_1(result) {
  _$jscoverage['/control.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['381'][1].init(796, 19, 'self.get(\'created\')');
function visit44_381_1(result) {
  _$jscoverage['/control.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['378'][1].init(433, 14, 'p.pluginSyncUI');
function visit43_378_1(result) {
  _$jscoverage['/control.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['375'][1].init(320, 14, 'p.pluginBindUI');
function visit42_375_1(result) {
  _$jscoverage['/control.js'].branchData['375'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['372'][1].init(202, 16, 'p.pluginRenderUI');
function visit41_372_1(result) {
  _$jscoverage['/control.js'].branchData['372'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['369'][1].init(83, 17, 'p.pluginCreateDom');
function visit40_369_1(result) {
  _$jscoverage['/control.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['367'][1].init(223, 20, 'self.get(\'rendered\')');
function visit39_367_1(result) {
  _$jscoverage['/control.js'].branchData['367'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['303'][1].init(84, 21, '!self.get(\'rendered\')');
function visit38_303_1(result) {
  _$jscoverage['/control.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['281'][1].init(759, 8, '!srcNode');
function visit37_281_1(result) {
  _$jscoverage['/control.js'].branchData['281'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['275'][1].init(412, 7, 'srcNode');
function visit36_275_1(result) {
  _$jscoverage['/control.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['266'][1].init(56, 20, '!self.get(\'created\')');
function visit35_266_1(result) {
  _$jscoverage['/control.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['245'][1].init(778, 31, 'self.get(\'handleGestureEvents\')');
function visit34_245_1(result) {
  _$jscoverage['/control.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['239'][1].init(460, 13, 'UA.ieMode < 9');
function visit33_239_1(result) {
  _$jscoverage['/control.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['231'][1].init(58, 21, 'self.get(\'focusable\')');
function visit32_231_1(result) {
  _$jscoverage['/control.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['220'][1].init(259, 6, 'render');
function visit31_220_1(result) {
  _$jscoverage['/control.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['218'][1].init(142, 12, 'renderBefore');
function visit30_218_1(result) {
  _$jscoverage['/control.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['215'][1].init(344, 20, '!self.get(\'srcNode\')');
function visit29_215_1(result) {
  _$jscoverage['/control.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['211'][1].init(171, 31, '!self.get(\'allowTextSelection\')');
function visit28_211_1(result) {
  _$jscoverage['/control.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['174'][1].init(1517, 23, 'self.get(\'highlighted\')');
function visit27_174_1(result) {
  _$jscoverage['/control.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['166'][1].init(1194, 8, '!visible');
function visit26_166_1(result) {
  _$jscoverage['/control.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['162'][1].init(1092, 6, 'zIndex');
function visit25_162_1(result) {
  _$jscoverage['/control.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['159'][1].init(986, 6, 'height');
function visit24_159_1(result) {
  _$jscoverage['/control.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['156'][1].init(883, 5, 'width');
function visit23_156_1(result) {
  _$jscoverage['/control.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['146'][1].init(71, 11, 'attr.render');
function visit22_146_1(result) {
  _$jscoverage['/control.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['124'][1].init(114, 13, 'attr.selector');
function visit21_124_1(result) {
  _$jscoverage['/control.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['80'][2].init(61, 35, 'options.params && options.params[0]');
function visit20_80_2(result) {
  _$jscoverage['/control.js'].branchData['80'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['80'][1].init(60, 46, 'options && options.params && options.params[0]');
function visit19_80_1(result) {
  _$jscoverage['/control.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['71'][1].init(112, 17, 'ret !== undefined');
function visit18_71_1(result) {
  _$jscoverage['/control.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['68'][1].init(90, 10, 'attr.parse');
function visit17_68_1(result) {
  _$jscoverage['/control.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['51'][1].init(14, 21, 'typeof v === \'number\'');
function visit16_51_1(result) {
  _$jscoverage['/control.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['42'][1].init(156, 5, 'i < l');
function visit15_42_1(result) {
  _$jscoverage['/control.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['30'][1].init(77, 26, 'typeof extras === \'string\'');
function visit14_30_1(result) {
  _$jscoverage['/control.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['27'][1].init(14, 7, '!extras');
function visit13_27_1(result) {
  _$jscoverage['/control.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/control.js'].functionData[0]++;
  _$jscoverage['/control.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/control.js'].lineData[8]++;
  var Node = require('node');
  _$jscoverage['/control.js'].lineData[9]++;
  var BasicGesture = require('event/gesture/basic');
  _$jscoverage['/control.js'].lineData[10]++;
  var TapGesture = require('event/gesture/tap');
  _$jscoverage['/control.js'].lineData[11]++;
  var Manager = require('./control/manager');
  _$jscoverage['/control.js'].lineData[12]++;
  var Base = require('base');
  _$jscoverage['/control.js'].lineData[13]++;
  var RenderTpl = require('./control/render-xtpl');
  _$jscoverage['/control.js'].lineData[14]++;
  var UA = require('ua');
  _$jscoverage['/control.js'].lineData[15]++;
  var Feature = require('feature');
  _$jscoverage['/control.js'].lineData[16]++;
  var __getHook = Base.prototype.__getHook;
  _$jscoverage['/control.js'].lineData[17]++;
  var startTpl = RenderTpl;
  _$jscoverage['/control.js'].lineData[18]++;
  var endTpl = '</div>';
  _$jscoverage['/control.js'].lineData[19]++;
  var isTouchGestureSupported = Feature.isTouchGestureSupported();
  _$jscoverage['/control.js'].lineData[20]++;
  var noop = util.noop;
  _$jscoverage['/control.js'].lineData[21]++;
  var XTemplateRuntime = require('xtemplate/runtime');
  _$jscoverage['/control.js'].lineData[22]++;
  var trim = util.trim;
  _$jscoverage['/control.js'].lineData[23]++;
  var $ = Node.all;
  _$jscoverage['/control.js'].lineData[24]++;
  var doc = S.Env.host.document;
  _$jscoverage['/control.js'].lineData[26]++;
  function normalExtras(extras) {
    _$jscoverage['/control.js'].functionData[1]++;
    _$jscoverage['/control.js'].lineData[27]++;
    if (visit13_27_1(!extras)) {
      _$jscoverage['/control.js'].lineData[28]++;
      extras = [''];
    }
    _$jscoverage['/control.js'].lineData[30]++;
    if (visit14_30_1(typeof extras === 'string')) {
      _$jscoverage['/control.js'].lineData[31]++;
      extras = extras.split(/\s+/);
    }
    _$jscoverage['/control.js'].lineData[33]++;
    return extras;
  }
  _$jscoverage['/control.js'].lineData[36]++;
  function prefixExtra(prefixCls, componentCls, extras) {
    _$jscoverage['/control.js'].functionData[2]++;
    _$jscoverage['/control.js'].lineData[37]++;
    var cls = '', i = 0, l = extras.length, e, prefix = prefixCls + componentCls;
    _$jscoverage['/control.js'].lineData[42]++;
    for (; visit15_42_1(i < l); i++) {
      _$jscoverage['/control.js'].lineData[43]++;
      e = extras[i];
      _$jscoverage['/control.js'].lineData[44]++;
      e = e ? ('-' + e) : e;
      _$jscoverage['/control.js'].lineData[45]++;
      cls += ' ' + prefix + e;
    }
    _$jscoverage['/control.js'].lineData[47]++;
    return cls;
  }
  _$jscoverage['/control.js'].lineData[50]++;
  function pxSetter(v) {
    _$jscoverage['/control.js'].functionData[3]++;
    _$jscoverage['/control.js'].lineData[51]++;
    if (visit16_51_1(typeof v === 'number')) {
      _$jscoverage['/control.js'].lineData[52]++;
      v += 'px';
    }
    _$jscoverage['/control.js'].lineData[54]++;
    return v;
  }
  _$jscoverage['/control.js'].lineData[57]++;
  function applyParser(srcNode) {
    _$jscoverage['/control.js'].functionData[4]++;
    _$jscoverage['/control.js'].lineData[58]++;
    var self = this, attr, attrName, ret;
    _$jscoverage['/control.js'].lineData[61]++;
    var attrs = self.getAttrs();
    _$jscoverage['/control.js'].lineData[65]++;
    for (attrName in attrs) {
      _$jscoverage['/control.js'].lineData[66]++;
      attr = attrs[attrName];
      _$jscoverage['/control.js'].lineData[68]++;
      if (visit17_68_1(attr.parse)) {
        _$jscoverage['/control.js'].lineData[70]++;
        ret = attr.parse.call(self, srcNode);
        _$jscoverage['/control.js'].lineData[71]++;
        if (visit18_71_1(ret !== undefined)) {
          _$jscoverage['/control.js'].lineData[72]++;
          self.setInternal(attrName, ret);
        }
      }
    }
  }
  _$jscoverage['/control.js'].lineData[79]++;
  function getBaseCssClassesCmd(_, options) {
    _$jscoverage['/control.js'].functionData[5]++;
    _$jscoverage['/control.js'].lineData[80]++;
    return this.root.config.control.getBaseCssClasses(visit19_80_1(options && visit20_80_2(options.params && options.params[0])));
  }
  _$jscoverage['/control.js'].lineData[83]++;
  function getBaseCssClassCmd() {
    _$jscoverage['/control.js'].functionData[6]++;
    _$jscoverage['/control.js'].lineData[84]++;
    return this.root.config.control.getBaseCssClass(arguments[1].params[0]);
  }
  _$jscoverage['/control.js'].lineData[92]++;
  var Control = Base.extend({
  isControl: true, 
  bindInternal: noop, 
  syncInternal: noop, 
  initializer: function() {
  _$jscoverage['/control.js'].functionData[7]++;
  _$jscoverage['/control.js'].lineData[112]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[113]++;
  var attrName, attr;
  _$jscoverage['/control.js'].lineData[114]++;
  var attrs = self.getAttrs();
  _$jscoverage['/control.js'].lineData[115]++;
  self.renderData = {};
  _$jscoverage['/control.js'].lineData[116]++;
  self.childrenElSelectors = {};
  _$jscoverage['/control.js'].lineData[117]++;
  self.renderCommands = {
  getBaseCssClasses: getBaseCssClassesCmd, 
  getBaseCssClass: getBaseCssClassCmd};
  _$jscoverage['/control.js'].lineData[121]++;
  for (attrName in attrs) {
    _$jscoverage['/control.js'].lineData[122]++;
    attr = attrs[attrName];
    _$jscoverage['/control.js'].lineData[124]++;
    if (visit21_124_1(attr.selector)) {
      _$jscoverage['/control.js'].lineData[125]++;
      self.childrenElSelectors[attrName] = attr.selector;
    }
  }
}, 
  beforeCreateDom: function(renderData) {
  _$jscoverage['/control.js'].functionData[8]++;
  _$jscoverage['/control.js'].lineData[131]++;
  var self = this, width, height, visible, elAttrs = self.get('elAttrs'), disabled, attrs = self.getAttrs(), attrName, attr, elStyle = self.get('elStyle'), zIndex, elCls = self.get('elCls');
  _$jscoverage['/control.js'].lineData[144]++;
  for (attrName in attrs) {
    _$jscoverage['/control.js'].lineData[145]++;
    attr = attrs[attrName];
    _$jscoverage['/control.js'].lineData[146]++;
    if (visit22_146_1(attr.render)) {
      _$jscoverage['/control.js'].lineData[147]++;
      renderData[attrName] = self.get(attrName);
    }
  }
  _$jscoverage['/control.js'].lineData[151]++;
  width = renderData.width;
  _$jscoverage['/control.js'].lineData[152]++;
  height = renderData.height;
  _$jscoverage['/control.js'].lineData[153]++;
  visible = renderData.visible;
  _$jscoverage['/control.js'].lineData[154]++;
  zIndex = renderData.zIndex;
  _$jscoverage['/control.js'].lineData[156]++;
  if (visit23_156_1(width)) {
    _$jscoverage['/control.js'].lineData[157]++;
    elStyle.width = pxSetter(width);
  }
  _$jscoverage['/control.js'].lineData[159]++;
  if (visit24_159_1(height)) {
    _$jscoverage['/control.js'].lineData[160]++;
    elStyle.height = pxSetter(height);
  }
  _$jscoverage['/control.js'].lineData[162]++;
  if (visit25_162_1(zIndex)) {
    _$jscoverage['/control.js'].lineData[163]++;
    elStyle['z-index'] = zIndex;
  }
  _$jscoverage['/control.js'].lineData[166]++;
  if (visit26_166_1(!visible)) {
    _$jscoverage['/control.js'].lineData[167]++;
    elCls.push(self.getBaseCssClasses('hidden'));
  }
  _$jscoverage['/control.js'].lineData[170]++;
  if ((disabled = self.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[171]++;
    elCls.push(self.getBaseCssClasses('disabled'));
    _$jscoverage['/control.js'].lineData[172]++;
    elAttrs['aria-disabled'] = 'true';
  }
  _$jscoverage['/control.js'].lineData[174]++;
  if (visit27_174_1(self.get('highlighted'))) {
    _$jscoverage['/control.js'].lineData[175]++;
    elCls.push(self.getBaseCssClasses('hover'));
  }
}, 
  createDom: function() {
  _$jscoverage['/control.js'].functionData[9]++;
  _$jscoverage['/control.js'].lineData[184]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[187]++;
  var html = self.renderTpl(startTpl) + self.renderTpl(self.get('contentTpl')) + endTpl;
  _$jscoverage['/control.js'].lineData[188]++;
  self.$el = $(html);
  _$jscoverage['/control.js'].lineData[189]++;
  self.el = self.$el[0];
  _$jscoverage['/control.js'].lineData[190]++;
  self.fillChildrenElsBySelectors();
}, 
  decorateDom: function(srcNode) {
  _$jscoverage['/control.js'].functionData[10]++;
  _$jscoverage['/control.js'].lineData[194]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[195]++;
  self.$el = srcNode;
  _$jscoverage['/control.js'].lineData[196]++;
  self.el = srcNode[0];
  _$jscoverage['/control.js'].lineData[198]++;
  self.fillChildrenElsBySelectors();
  _$jscoverage['/control.js'].lineData[199]++;
  applyParser.call(self, srcNode);
}, 
  renderUI: function() {
  _$jscoverage['/control.js'].functionData[11]++;
  _$jscoverage['/control.js'].lineData[207]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[209]++;
  Manager.addComponent(self);
  _$jscoverage['/control.js'].lineData[210]++;
  var $el = self.$el;
  _$jscoverage['/control.js'].lineData[211]++;
  if (visit28_211_1(!self.get('allowTextSelection'))) {
    _$jscoverage['/control.js'].lineData[212]++;
    $el.unselectable();
  }
  _$jscoverage['/control.js'].lineData[215]++;
  if (visit29_215_1(!self.get('srcNode'))) {
    _$jscoverage['/control.js'].lineData[216]++;
    var render = self.get('render'), renderBefore = self.get('elBefore');
    _$jscoverage['/control.js'].lineData[218]++;
    if (visit30_218_1(renderBefore)) {
      _$jscoverage['/control.js'].lineData[219]++;
      $el.insertBefore(renderBefore, undefined);
    } else {
      _$jscoverage['/control.js'].lineData[220]++;
      if (visit31_220_1(render)) {
        _$jscoverage['/control.js'].lineData[221]++;
        $el.appendTo(render, undefined);
      } else {
        _$jscoverage['/control.js'].lineData[223]++;
        $el.appendTo(doc.body, undefined);
      }
    }
  }
}, 
  bindUI: function() {
  _$jscoverage['/control.js'].functionData[12]++;
  _$jscoverage['/control.js'].lineData[229]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[231]++;
  if (visit32_231_1(self.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[232]++;
    var keyEventTarget = self.getKeyEventTarget();
    _$jscoverage['/control.js'].lineData[237]++;
    keyEventTarget.on('focus', self.handleFocus, self).on('blur', self.handleBlur, self).on('keydown', self.handleKeydown, self);
    _$jscoverage['/control.js'].lineData[239]++;
    if (visit33_239_1(UA.ieMode < 9)) {
      _$jscoverage['/control.js'].lineData[240]++;
      keyEventTarget.attr('hideFocus', true);
    }
    _$jscoverage['/control.js'].lineData[242]++;
    keyEventTarget.attr('tabindex', self.get('disabled') ? '-1' : '0');
  }
  _$jscoverage['/control.js'].lineData[245]++;
  if (visit34_245_1(self.get('handleGestureEvents'))) {
    _$jscoverage['/control.js'].lineData[253]++;
    self.$el.on('mouseenter', self.handleMouseEnter, self).on('mouseleave', self.handleMouseLeave, self).on('contextmenu', self.handleContextMenu, self).on(BasicGesture.START, self.handleMouseDown, self).on(BasicGesture.END, self.handleMouseUp, self).on(TapGesture.TAP, self.handleClick, self);
  }
}, 
  syncUI: noop, 
  create: function() {
  _$jscoverage['/control.js'].functionData[13]++;
  _$jscoverage['/control.js'].lineData[265]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[266]++;
  if (visit35_266_1(!self.get('created'))) {
    _$jscoverage['/control.js'].lineData[272]++;
    self.fire('beforeCreateDom');
    _$jscoverage['/control.js'].lineData[273]++;
    var srcNode = self.get('srcNode');
    _$jscoverage['/control.js'].lineData[275]++;
    if (visit36_275_1(srcNode)) {
      _$jscoverage['/control.js'].lineData[276]++;
      self.decorateDom(srcNode);
    }
    _$jscoverage['/control.js'].lineData[279]++;
    self.beforeCreateDom(self.renderData, self.renderCommands, self.childrenElSelectors);
    _$jscoverage['/control.js'].lineData[281]++;
    if (visit37_281_1(!srcNode)) {
      _$jscoverage['/control.js'].lineData[282]++;
      self.createDom();
    }
    _$jscoverage['/control.js'].lineData[284]++;
    self.__callPluginsMethod('pluginCreateDom');
    _$jscoverage['/control.js'].lineData[290]++;
    self.fire('afterCreateDom');
    _$jscoverage['/control.js'].lineData[291]++;
    self.setInternal('created', true);
  }
  _$jscoverage['/control.js'].lineData[293]++;
  return self;
}, 
  render: function() {
  _$jscoverage['/control.js'].functionData[14]++;
  _$jscoverage['/control.js'].lineData[301]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[303]++;
  if (visit38_303_1(!self.get('rendered'))) {
    _$jscoverage['/control.js'].lineData[304]++;
    self.create();
    _$jscoverage['/control.js'].lineData[312]++;
    self.fire('beforeRenderUI');
    _$jscoverage['/control.js'].lineData[313]++;
    self.renderUI();
    _$jscoverage['/control.js'].lineData[314]++;
    self.__callPluginsMethod('pluginRenderUI');
    _$jscoverage['/control.js'].lineData[321]++;
    self.fire('afterRenderUI');
    _$jscoverage['/control.js'].lineData[329]++;
    self.fire('beforeBindUI');
    _$jscoverage['/control.js'].lineData[330]++;
    Control.superclass.bindInternal.call(self);
    _$jscoverage['/control.js'].lineData[331]++;
    self.bindUI();
    _$jscoverage['/control.js'].lineData[332]++;
    self.__callPluginsMethod('pluginBindUI');
    _$jscoverage['/control.js'].lineData[338]++;
    self.fire('afterBindUI');
    _$jscoverage['/control.js'].lineData[345]++;
    self.fire('beforeSyncUI');
    _$jscoverage['/control.js'].lineData[346]++;
    Control.superclass.syncInternal.call(self);
    _$jscoverage['/control.js'].lineData[347]++;
    self.syncUI();
    _$jscoverage['/control.js'].lineData[348]++;
    self.__callPluginsMethod('pluginSyncUI');
    _$jscoverage['/control.js'].lineData[354]++;
    self.fire('afterSyncUI');
    _$jscoverage['/control.js'].lineData[356]++;
    self.setInternal('rendered', true);
  }
  _$jscoverage['/control.js'].lineData[358]++;
  return self;
}, 
  plug: function(plugin) {
  _$jscoverage['/control.js'].functionData[15]++;
  _$jscoverage['/control.js'].lineData[362]++;
  var self = this, p, plugins = self.get('plugins');
  _$jscoverage['/control.js'].lineData[365]++;
  self.callSuper(plugin);
  _$jscoverage['/control.js'].lineData[366]++;
  p = plugins[plugins.length - 1];
  _$jscoverage['/control.js'].lineData[367]++;
  if (visit39_367_1(self.get('rendered'))) {
    _$jscoverage['/control.js'].lineData[369]++;
    if (visit40_369_1(p.pluginCreateDom)) {
      _$jscoverage['/control.js'].lineData[370]++;
      p.pluginCreateDom(self);
    }
    _$jscoverage['/control.js'].lineData[372]++;
    if (visit41_372_1(p.pluginRenderUI)) {
      _$jscoverage['/control.js'].lineData[373]++;
      p.pluginCreateDom(self);
    }
    _$jscoverage['/control.js'].lineData[375]++;
    if (visit42_375_1(p.pluginBindUI)) {
      _$jscoverage['/control.js'].lineData[376]++;
      p.pluginBindUI(self);
    }
    _$jscoverage['/control.js'].lineData[378]++;
    if (visit43_378_1(p.pluginSyncUI)) {
      _$jscoverage['/control.js'].lineData[379]++;
      p.pluginSyncUI(self);
    }
  } else {
    _$jscoverage['/control.js'].lineData[381]++;
    if (visit44_381_1(self.get('created'))) {
      _$jscoverage['/control.js'].lineData[382]++;
      if (visit45_382_1(p.pluginCreateDom)) {
        _$jscoverage['/control.js'].lineData[383]++;
        p.pluginCreateDom(self);
      }
    }
  }
  _$jscoverage['/control.js'].lineData[386]++;
  return self;
}, 
  getKeyEventTarget: function() {
  _$jscoverage['/control.js'].functionData[16]++;
  _$jscoverage['/control.js'].lineData[395]++;
  return this.$el;
}, 
  handleMouseEnter: function(ev) {
  _$jscoverage['/control.js'].functionData[17]++;
  _$jscoverage['/control.js'].lineData[399]++;
  if (visit46_399_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[400]++;
    this.handleMouseEnterInternal(ev);
  }
}, 
  handleMouseEnterInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[18]++;
  _$jscoverage['/control.js'].lineData[410]++;
  this.set('highlighted', !!ev);
}, 
  handleMouseLeave: function(ev) {
  _$jscoverage['/control.js'].functionData[19]++;
  _$jscoverage['/control.js'].lineData[414]++;
  if (visit47_414_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[415]++;
    this.handleMouseLeaveInternal(ev);
  }
}, 
  handleMouseLeaveInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[20]++;
  _$jscoverage['/control.js'].lineData[425]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[426]++;
  self.set('active', false);
  _$jscoverage['/control.js'].lineData[427]++;
  self.set('highlighted', !ev);
}, 
  handleMouseDown: function(ev) {
  _$jscoverage['/control.js'].functionData[21]++;
  _$jscoverage['/control.js'].lineData[431]++;
  if (visit48_431_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[432]++;
    this.handleMouseDownInternal(ev);
  }
}, 
  handleMouseDownInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[22]++;
  _$jscoverage['/control.js'].lineData[445]++;
  var self = this, n, isMouseActionButton = visit49_447_1(ev.which === 1);
  _$jscoverage['/control.js'].lineData[448]++;
  if (visit50_448_1(isMouseActionButton || isTouchGestureSupported)) {
    _$jscoverage['/control.js'].lineData[449]++;
    if (visit51_449_1(self.get('activeable'))) {
      _$jscoverage['/control.js'].lineData[450]++;
      self.set('active', true);
    }
    _$jscoverage['/control.js'].lineData[452]++;
    if (visit52_452_1(self.get('focusable'))) {
      _$jscoverage['/control.js'].lineData[453]++;
      self.focus();
    }
    _$jscoverage['/control.js'].lineData[457]++;
    if (visit53_457_1(!self.get('allowTextSelection') && visit54_457_2(ev.gestureType === 'mouse'))) {
      _$jscoverage['/control.js'].lineData[460]++;
      n = ev.target.nodeName;
      _$jscoverage['/control.js'].lineData[461]++;
      n = visit55_461_1(n && n.toLowerCase());
      _$jscoverage['/control.js'].lineData[463]++;
      if (visit56_463_1(visit57_463_2(n !== 'input') && visit58_463_3(visit59_463_4(n !== 'textarea') && visit60_463_5(n !== 'button')))) {
        _$jscoverage['/control.js'].lineData[464]++;
        ev.preventDefault();
      }
    }
  }
}, 
  handleMouseUp: function(ev) {
  _$jscoverage['/control.js'].functionData[23]++;
  _$jscoverage['/control.js'].lineData[471]++;
  if (visit61_471_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[472]++;
    this.handleMouseUpInternal(ev);
  }
}, 
  handleMouseUpInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[24]++;
  _$jscoverage['/control.js'].lineData[484]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[486]++;
  if (visit62_486_1(self.get('active') && (visit63_486_2(visit64_486_3(ev.which === 1) || isTouchGestureSupported)))) {
    _$jscoverage['/control.js'].lineData[487]++;
    self.set('active', false);
  }
}, 
  handleContextMenu: function(ev) {
  _$jscoverage['/control.js'].functionData[25]++;
  _$jscoverage['/control.js'].lineData[492]++;
  if (visit65_492_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[493]++;
    this.handleContextMenuInternal(ev);
  }
}, 
  handleContextMenuInternal: function() {
  _$jscoverage['/control.js'].functionData[26]++;
}, 
  handleFocus: function() {
  _$jscoverage['/control.js'].functionData[27]++;
  _$jscoverage['/control.js'].lineData[505]++;
  if (visit66_505_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[506]++;
    this.handleFocusInternal();
  }
}, 
  handleFocusInternal: function() {
  _$jscoverage['/control.js'].functionData[28]++;
  _$jscoverage['/control.js'].lineData[515]++;
  this.focus();
  _$jscoverage['/control.js'].lineData[516]++;
  this.fire('focus');
}, 
  handleBlur: function() {
  _$jscoverage['/control.js'].functionData[29]++;
  _$jscoverage['/control.js'].lineData[520]++;
  if (visit67_520_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[521]++;
    this.handleBlurInternal();
  }
}, 
  handleBlurInternal: function() {
  _$jscoverage['/control.js'].functionData[30]++;
  _$jscoverage['/control.js'].lineData[530]++;
  this.blur();
  _$jscoverage['/control.js'].lineData[531]++;
  this.fire('blur');
}, 
  handleKeydown: function(ev) {
  _$jscoverage['/control.js'].functionData[31]++;
  _$jscoverage['/control.js'].lineData[535]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[536]++;
  if (visit68_536_1(!this.get('disabled') && self.handleKeyDownInternal(ev))) {
    _$jscoverage['/control.js'].lineData[537]++;
    ev.halt();
    _$jscoverage['/control.js'].lineData[538]++;
    return true;
  }
  _$jscoverage['/control.js'].lineData[540]++;
  return undefined;
}, 
  handleKeyDownInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[32]++;
  _$jscoverage['/control.js'].lineData[549]++;
  if (visit69_549_1(ev.keyCode === Node.KeyCode.ENTER)) {
    _$jscoverage['/control.js'].lineData[550]++;
    return this.handleClickInternal(ev);
  }
  _$jscoverage['/control.js'].lineData[552]++;
  return undefined;
}, 
  handleClick: function(ev) {
  _$jscoverage['/control.js'].functionData[33]++;
  _$jscoverage['/control.js'].lineData[556]++;
  if (visit70_556_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[557]++;
    this.handleClickInternal(ev);
  }
}, 
  handleClickInternal: function() {
  _$jscoverage['/control.js'].functionData[34]++;
  _$jscoverage['/control.js'].lineData[567]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[568]++;
  if (visit71_568_1(self.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[569]++;
    self.focus();
  }
}, 
  $: function(selector) {
  _$jscoverage['/control.js'].functionData[35]++;
  _$jscoverage['/control.js'].lineData[574]++;
  return this.$el.all(selector);
}, 
  fillChildrenElsBySelectors: function(childrenElSelectors) {
  _$jscoverage['/control.js'].functionData[36]++;
  _$jscoverage['/control.js'].lineData[578]++;
  var self = this, el = self.$el, childName, selector;
  _$jscoverage['/control.js'].lineData[582]++;
  childrenElSelectors = visit72_582_1(childrenElSelectors || self.childrenElSelectors);
  _$jscoverage['/control.js'].lineData[584]++;
  for (childName in childrenElSelectors) {
    _$jscoverage['/control.js'].lineData[585]++;
    selector = childrenElSelectors[childName];
    _$jscoverage['/control.js'].lineData[586]++;
    var node = selector.call(self, el);
    _$jscoverage['/control.js'].lineData[587]++;
    if (visit73_587_1(typeof node === 'string')) {
      _$jscoverage['/control.js'].lineData[588]++;
      node = self.$(node);
    }
    _$jscoverage['/control.js'].lineData[590]++;
    self.setInternal(childName, node);
  }
}, 
  renderTpl: function(tpl, renderData, renderCommands) {
  _$jscoverage['/control.js'].functionData[37]++;
  _$jscoverage['/control.js'].lineData[595]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[596]++;
  renderData = visit74_596_1(renderData || self.renderData);
  _$jscoverage['/control.js'].lineData[597]++;
  renderCommands = visit75_597_1(renderCommands || self.renderCommands);
  _$jscoverage['/control.js'].lineData[598]++;
  var XTemplate = self.get('XTemplate');
  _$jscoverage['/control.js'].lineData[599]++;
  return new XTemplate(tpl, {
  control: self, 
  commands: renderCommands}).render(renderData);
}, 
  getComponentConstructorByNode: function(prefixCls, childNode) {
  _$jscoverage['/control.js'].functionData[38]++;
  _$jscoverage['/control.js'].lineData[611]++;
  var cls = childNode[0].className;
  _$jscoverage['/control.js'].lineData[613]++;
  if (visit76_613_1(cls)) {
    _$jscoverage['/control.js'].lineData[614]++;
    cls = cls.replace(new RegExp('\\b' + prefixCls, 'ig'), '');
    _$jscoverage['/control.js'].lineData[615]++;
    return Manager.getConstructorByXClass(cls);
  }
  _$jscoverage['/control.js'].lineData[617]++;
  return null;
}, 
  getComponentCssClasses: function() {
  _$jscoverage['/control.js'].functionData[39]++;
  _$jscoverage['/control.js'].lineData[621]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[622]++;
  if (visit77_622_1(self.componentCssClasses)) {
    _$jscoverage['/control.js'].lineData[623]++;
    return self.componentCssClasses;
  }
  _$jscoverage['/control.js'].lineData[625]++;
  var constructor = self.constructor, xclass, re = [];
  _$jscoverage['/control.js'].lineData[628]++;
  while (visit78_628_1(constructor && !constructor.prototype.hasOwnProperty('isControl'))) {
    _$jscoverage['/control.js'].lineData[629]++;
    xclass = constructor.xclass;
    _$jscoverage['/control.js'].lineData[630]++;
    if (visit79_630_1(xclass)) {
      _$jscoverage['/control.js'].lineData[631]++;
      re.push(xclass);
    }
    _$jscoverage['/control.js'].lineData[633]++;
    constructor = visit80_633_1(constructor.superclass && constructor.superclass.constructor);
  }
  _$jscoverage['/control.js'].lineData[635]++;
  self.componentCssClasses = re;
  _$jscoverage['/control.js'].lineData[636]++;
  return re;
}, 
  getBaseCssClasses: function(extras) {
  _$jscoverage['/control.js'].functionData[40]++;
  _$jscoverage['/control.js'].lineData[645]++;
  extras = normalExtras(extras);
  _$jscoverage['/control.js'].lineData[646]++;
  var componentCssClasses = this.getComponentCssClasses(), i = 0, cls = '', l = componentCssClasses.length, prefixCls = this.get('prefixCls');
  _$jscoverage['/control.js'].lineData[651]++;
  for (; visit81_651_1(i < l); i++) {
    _$jscoverage['/control.js'].lineData[652]++;
    cls += prefixExtra(prefixCls, componentCssClasses[i], extras);
  }
  _$jscoverage['/control.js'].lineData[654]++;
  return trim(cls);
}, 
  getBaseCssClass: function(extras) {
  _$jscoverage['/control.js'].functionData[41]++;
  _$jscoverage['/control.js'].lineData[664]++;
  return trim(prefixExtra(this.get('prefixCls'), this.getComponentCssClasses()[0], normalExtras(extras)));
}, 
  createComponent: function(cfg, parent) {
  _$jscoverage['/control.js'].functionData[42]++;
  _$jscoverage['/control.js'].lineData[671]++;
  return Manager.createComponent(cfg, visit82_671_1(parent || this));
}, 
  show: function() {
  _$jscoverage['/control.js'].functionData[43]++;
  _$jscoverage['/control.js'].lineData[679]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[680]++;
  self.render();
  _$jscoverage['/control.js'].lineData[681]++;
  self.set('visible', true);
  _$jscoverage['/control.js'].lineData[682]++;
  return self;
}, 
  hide: function() {
  _$jscoverage['/control.js'].functionData[44]++;
  _$jscoverage['/control.js'].lineData[690]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[691]++;
  self.set('visible', false);
  _$jscoverage['/control.js'].lineData[692]++;
  return self;
}, 
  focus: function() {
  _$jscoverage['/control.js'].functionData[45]++;
  _$jscoverage['/control.js'].lineData[696]++;
  if (visit83_696_1(this.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[697]++;
    this.set('focused', true);
  }
}, 
  blur: function() {
  _$jscoverage['/control.js'].functionData[46]++;
  _$jscoverage['/control.js'].lineData[702]++;
  if (visit84_702_1(this.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[703]++;
    this.set('focused', false);
  }
}, 
  move: function(x, y) {
  _$jscoverage['/control.js'].functionData[47]++;
  _$jscoverage['/control.js'].lineData[708]++;
  this.set({
  x: x, 
  y: y});
}, 
  _onSetWidth: function(w) {
  _$jscoverage['/control.js'].functionData[48]++;
  _$jscoverage['/control.js'].lineData[715]++;
  this.$el.width(w);
}, 
  _onSetHeight: function(h) {
  _$jscoverage['/control.js'].functionData[49]++;
  _$jscoverage['/control.js'].lineData[719]++;
  this.$el.height(h);
}, 
  _onSetContent: function(c) {
  _$jscoverage['/control.js'].functionData[50]++;
  _$jscoverage['/control.js'].lineData[723]++;
  var el = this.$el;
  _$jscoverage['/control.js'].lineData[724]++;
  el.html(c);
  _$jscoverage['/control.js'].lineData[726]++;
  if (visit85_726_1(!this.get('allowTextSelection'))) {
    _$jscoverage['/control.js'].lineData[727]++;
    el.unselectable();
  }
}, 
  _onSetVisible: function(visible) {
  _$jscoverage['/control.js'].functionData[51]++;
  _$jscoverage['/control.js'].lineData[732]++;
  var self = this, el = self.$el, hiddenCls = self.getBaseCssClasses('hidden');
  _$jscoverage['/control.js'].lineData[735]++;
  if (visit86_735_1(visible)) {
    _$jscoverage['/control.js'].lineData[736]++;
    el.removeClass(hiddenCls);
  } else {
    _$jscoverage['/control.js'].lineData[738]++;
    el.addClass(hiddenCls);
  }
  _$jscoverage['/control.js'].lineData[741]++;
  this.fire(visible ? 'show' : 'hide');
}, 
  _onSetHighlighted: function(v) {
  _$jscoverage['/control.js'].functionData[52]++;
  _$jscoverage['/control.js'].lineData[748]++;
  var self = this, componentCls = self.getBaseCssClasses('hover'), el = self.$el;
  _$jscoverage['/control.js'].lineData[751]++;
  el[v ? 'addClass' : 'removeClass'](componentCls);
}, 
  _onSetDisabled: function(v) {
  _$jscoverage['/control.js'].functionData[53]++;
  _$jscoverage['/control.js'].lineData[758]++;
  var self = this, componentCls = self.getBaseCssClasses('disabled'), el = self.$el;
  _$jscoverage['/control.js'].lineData[762]++;
  el[v ? 'addClass' : 'removeClass'](componentCls).attr('aria-disabled', v);
  _$jscoverage['/control.js'].lineData[763]++;
  if (visit87_763_1(self.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[765]++;
    self.getKeyEventTarget().attr('tabindex', v ? -1 : 0);
  }
}, 
  _onSetActive: function(v) {
  _$jscoverage['/control.js'].functionData[54]++;
  _$jscoverage['/control.js'].lineData[772]++;
  var self = this, componentCls = self.getBaseCssClasses('active');
  _$jscoverage['/control.js'].lineData[775]++;
  self.$el[v ? 'addClass' : 'removeClass'](componentCls).attr('aria-pressed', !!v);
}, 
  _onSetZIndex: function(v) {
  _$jscoverage['/control.js'].functionData[55]++;
  _$jscoverage['/control.js'].lineData[779]++;
  this.$el.css('z-index', v);
}, 
  _onSetFocused: function(v) {
  _$jscoverage['/control.js'].functionData[56]++;
  _$jscoverage['/control.js'].lineData[783]++;
  var target = this.getKeyEventTarget()[0];
  _$jscoverage['/control.js'].lineData[784]++;
  if (visit88_784_1(v)) {
    _$jscoverage['/control.js'].lineData[785]++;
    try {
      _$jscoverage['/control.js'].lineData[786]++;
      target.focus();
    }    catch (e) {
  _$jscoverage['/control.js'].lineData[788]++;
  S.log(target);
  _$jscoverage['/control.js'].lineData[789]++;
  S.log('focus error', 'warn');
}
  } else {
    _$jscoverage['/control.js'].lineData[794]++;
    if (visit89_794_1(target.ownerDocument.activeElement === target)) {
      _$jscoverage['/control.js'].lineData[795]++;
      target.ownerDocument.body.focus();
    }
  }
  _$jscoverage['/control.js'].lineData[798]++;
  var self = this, el = self.$el, componentCls = self.getBaseCssClasses('focused');
  _$jscoverage['/control.js'].lineData[801]++;
  el[v ? 'addClass' : 'removeClass'](componentCls);
}, 
  _onSetX: function(x) {
  _$jscoverage['/control.js'].functionData[57]++;
  _$jscoverage['/control.js'].lineData[805]++;
  this.$el.offset({
  left: x});
}, 
  _onSetY: function(y) {
  _$jscoverage['/control.js'].functionData[58]++;
  _$jscoverage['/control.js'].lineData[811]++;
  this.$el.offset({
  top: y});
}, 
  destructor: function(destroy) {
  _$jscoverage['/control.js'].functionData[59]++;
  _$jscoverage['/control.js'].lineData[820]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[822]++;
  Manager.removeComponent(self);
  _$jscoverage['/control.js'].lineData[823]++;
  if (visit90_823_1(visit91_823_2(destroy !== false) && self.$el)) {
    _$jscoverage['/control.js'].lineData[824]++;
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
  _$jscoverage['/control.js'].lineData[843]++;
  return buffer.write(scope.get('content'));
}}, 
  content: {
  parse: function(el) {
  _$jscoverage['/control.js'].functionData[61]++;
  _$jscoverage['/control.js'].lineData[861]++;
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
  _$jscoverage['/control.js'].lineData[912]++;
  return [];
}, 
  setter: function(v) {
  _$jscoverage['/control.js'].functionData[63]++;
  _$jscoverage['/control.js'].lineData[915]++;
  if (visit92_915_1(typeof v === 'string')) {
    _$jscoverage['/control.js'].lineData[916]++;
    v = v.split(/\s+/);
  }
  _$jscoverage['/control.js'].lineData[918]++;
  return visit93_918_1(v || []);
}}, 
  elStyle: {
  render: 1, 
  valueFn: function() {
  _$jscoverage['/control.js'].functionData[64]++;
  _$jscoverage['/control.js'].lineData[932]++;
  return {};
}}, 
  elAttrs: {
  render: 1, 
  valueFn: function() {
  _$jscoverage['/control.js'].functionData[65]++;
  _$jscoverage['/control.js'].lineData[946]++;
  return {};
}}, 
  x: {}, 
  y: {}, 
  xy: {
  setter: function(v) {
  _$jscoverage['/control.js'].functionData[66]++;
  _$jscoverage['/control.js'].lineData[990]++;
  var self = this, xy = util.makeArray(v);
  _$jscoverage['/control.js'].lineData[992]++;
  if (visit94_992_1(xy.length)) {
    _$jscoverage['/control.js'].lineData[993]++;
    if (visit95_993_1(xy[0] !== undefined)) {
      _$jscoverage['/control.js'].lineData[994]++;
      self.set('x', xy[0]);
    }
    _$jscoverage['/control.js'].lineData[996]++;
    if (visit96_996_1(xy[1] !== undefined)) {
      _$jscoverage['/control.js'].lineData[997]++;
      self.set('y', xy[1]);
    }
  }
  _$jscoverage['/control.js'].lineData[1000]++;
  return v;
}, 
  getter: function() {
  _$jscoverage['/control.js'].functionData[67]++;
  _$jscoverage['/control.js'].lineData[1003]++;
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
  _$jscoverage['/control.js'].lineData[1121]++;
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
  _$jscoverage['/control.js'].lineData[1168]++;
  var id = el.attr('id');
  _$jscoverage['/control.js'].lineData[1169]++;
  if (visit97_1169_1(!id)) {
    _$jscoverage['/control.js'].lineData[1170]++;
    id = util.guid('ks-component');
    _$jscoverage['/control.js'].lineData[1171]++;
    el.attr('id', id);
  }
  _$jscoverage['/control.js'].lineData[1173]++;
  return id;
}, 
  valueFn: function() {
  _$jscoverage['/control.js'].functionData[70]++;
  _$jscoverage['/control.js'].lineData[1176]++;
  return util.guid('ks-component');
}}, 
  elBefore: {}, 
  el: {
  getter: function() {
  _$jscoverage['/control.js'].functionData[71]++;
  _$jscoverage['/control.js'].lineData[1201]++;
  return this.$el;
}}, 
  srcNode: {
  setter: function(v) {
  _$jscoverage['/control.js'].functionData[72]++;
  _$jscoverage['/control.js'].lineData[1216]++;
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
  value: visit98_1279_1(S.config('component/prefixCls') || 'ks-')}, 
  prefixXClass: {}, 
  parent: {
  setter: function(p, prev) {
  _$jscoverage['/control.js'].functionData[73]++;
  _$jscoverage['/control.js'].lineData[1307]++;
  if ((prev = this.get('parent'))) {
    _$jscoverage['/control.js'].lineData[1308]++;
    this.removeTarget(prev);
  }
  _$jscoverage['/control.js'].lineData[1310]++;
  if (visit99_1310_1(p)) {
    _$jscoverage['/control.js'].lineData[1311]++;
    this.addTarget(p);
  }
}}, 
  XTemplate: {
  value: XTemplateRuntime}}});
  _$jscoverage['/control.js'].lineData[1341]++;
  Control.extend = function extend(extensions, px, sx) {
  _$jscoverage['/control.js'].functionData[74]++;
  _$jscoverage['/control.js'].lineData[1343]++;
  var args = util.makeArray(arguments), self = this, xclass, argsLen = args.length, last = args[argsLen - 1];
  _$jscoverage['/control.js'].lineData[1349]++;
  if (visit100_1349_1(last && (xclass = last.xclass))) {
    _$jscoverage['/control.js'].lineData[1350]++;
    last.name = xclass;
  }
  _$jscoverage['/control.js'].lineData[1353]++;
  var NewClass = Base.extend.apply(self, arguments);
  _$jscoverage['/control.js'].lineData[1355]++;
  NewClass.extend = extend;
  _$jscoverage['/control.js'].lineData[1357]++;
  if (visit101_1357_1(xclass)) {
    _$jscoverage['/control.js'].lineData[1358]++;
    Manager.setConstructorByXClass(xclass, NewClass);
  }
  _$jscoverage['/control.js'].lineData[1361]++;
  return NewClass;
};
  _$jscoverage['/control.js'].lineData[1364]++;
  Control.Manager = Manager;
  _$jscoverage['/control.js'].lineData[1366]++;
  return Control;
});
