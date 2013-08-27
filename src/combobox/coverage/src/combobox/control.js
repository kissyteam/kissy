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
if (! _$jscoverage['/combobox/control.js']) {
  _$jscoverage['/combobox/control.js'] = {};
  _$jscoverage['/combobox/control.js'].lineData = [];
  _$jscoverage['/combobox/control.js'].lineData[6] = 0;
  _$jscoverage['/combobox/control.js'].lineData[7] = 0;
  _$jscoverage['/combobox/control.js'].lineData[16] = 0;
  _$jscoverage['/combobox/control.js'].lineData[29] = 0;
  _$jscoverage['/combobox/control.js'].lineData[31] = 0;
  _$jscoverage['/combobox/control.js'].lineData[32] = 0;
  _$jscoverage['/combobox/control.js'].lineData[33] = 0;
  _$jscoverage['/combobox/control.js'].lineData[34] = 0;
  _$jscoverage['/combobox/control.js'].lineData[37] = 0;
  _$jscoverage['/combobox/control.js'].lineData[39] = 0;
  _$jscoverage['/combobox/control.js'].lineData[40] = 0;
  _$jscoverage['/combobox/control.js'].lineData[41] = 0;
  _$jscoverage['/combobox/control.js'].lineData[47] = 0;
  _$jscoverage['/combobox/control.js'].lineData[49] = 0;
  _$jscoverage['/combobox/control.js'].lineData[53] = 0;
  _$jscoverage['/combobox/control.js'].lineData[56] = 0;
  _$jscoverage['/combobox/control.js'].lineData[66] = 0;
  _$jscoverage['/combobox/control.js'].lineData[68] = 0;
  _$jscoverage['/combobox/control.js'].lineData[69] = 0;
  _$jscoverage['/combobox/control.js'].lineData[74] = 0;
  _$jscoverage['/combobox/control.js'].lineData[82] = 0;
  _$jscoverage['/combobox/control.js'].lineData[92] = 0;
  _$jscoverage['/combobox/control.js'].lineData[97] = 0;
  _$jscoverage['/combobox/control.js'].lineData[100] = 0;
  _$jscoverage['/combobox/control.js'].lineData[101] = 0;
  _$jscoverage['/combobox/control.js'].lineData[103] = 0;
  _$jscoverage['/combobox/control.js'].lineData[104] = 0;
  _$jscoverage['/combobox/control.js'].lineData[105] = 0;
  _$jscoverage['/combobox/control.js'].lineData[107] = 0;
  _$jscoverage['/combobox/control.js'].lineData[109] = 0;
  _$jscoverage['/combobox/control.js'].lineData[112] = 0;
  _$jscoverage['/combobox/control.js'].lineData[117] = 0;
  _$jscoverage['/combobox/control.js'].lineData[119] = 0;
  _$jscoverage['/combobox/control.js'].lineData[120] = 0;
  _$jscoverage['/combobox/control.js'].lineData[122] = 0;
  _$jscoverage['/combobox/control.js'].lineData[123] = 0;
  _$jscoverage['/combobox/control.js'].lineData[129] = 0;
  _$jscoverage['/combobox/control.js'].lineData[131] = 0;
  _$jscoverage['/combobox/control.js'].lineData[132] = 0;
  _$jscoverage['/combobox/control.js'].lineData[133] = 0;
  _$jscoverage['/combobox/control.js'].lineData[134] = 0;
  _$jscoverage['/combobox/control.js'].lineData[135] = 0;
  _$jscoverage['/combobox/control.js'].lineData[136] = 0;
  _$jscoverage['/combobox/control.js'].lineData[137] = 0;
  _$jscoverage['/combobox/control.js'].lineData[140] = 0;
  _$jscoverage['/combobox/control.js'].lineData[144] = 0;
  _$jscoverage['/combobox/control.js'].lineData[145] = 0;
  _$jscoverage['/combobox/control.js'].lineData[150] = 0;
  _$jscoverage['/combobox/control.js'].lineData[153] = 0;
  _$jscoverage['/combobox/control.js'].lineData[154] = 0;
  _$jscoverage['/combobox/control.js'].lineData[155] = 0;
  _$jscoverage['/combobox/control.js'].lineData[156] = 0;
  _$jscoverage['/combobox/control.js'].lineData[157] = 0;
  _$jscoverage['/combobox/control.js'].lineData[159] = 0;
  _$jscoverage['/combobox/control.js'].lineData[160] = 0;
  _$jscoverage['/combobox/control.js'].lineData[163] = 0;
  _$jscoverage['/combobox/control.js'].lineData[165] = 0;
  _$jscoverage['/combobox/control.js'].lineData[170] = 0;
  _$jscoverage['/combobox/control.js'].lineData[178] = 0;
  _$jscoverage['/combobox/control.js'].lineData[179] = 0;
  _$jscoverage['/combobox/control.js'].lineData[181] = 0;
  _$jscoverage['/combobox/control.js'].lineData[183] = 0;
  _$jscoverage['/combobox/control.js'].lineData[187] = 0;
  _$jscoverage['/combobox/control.js'].lineData[188] = 0;
  _$jscoverage['/combobox/control.js'].lineData[189] = 0;
  _$jscoverage['/combobox/control.js'].lineData[195] = 0;
  _$jscoverage['/combobox/control.js'].lineData[196] = 0;
  _$jscoverage['/combobox/control.js'].lineData[197] = 0;
  _$jscoverage['/combobox/control.js'].lineData[201] = 0;
  _$jscoverage['/combobox/control.js'].lineData[203] = 0;
  _$jscoverage['/combobox/control.js'].lineData[206] = 0;
  _$jscoverage['/combobox/control.js'].lineData[207] = 0;
  _$jscoverage['/combobox/control.js'].lineData[208] = 0;
  _$jscoverage['/combobox/control.js'].lineData[212] = 0;
  _$jscoverage['/combobox/control.js'].lineData[214] = 0;
  _$jscoverage['/combobox/control.js'].lineData[217] = 0;
  _$jscoverage['/combobox/control.js'].lineData[220] = 0;
  _$jscoverage['/combobox/control.js'].lineData[225] = 0;
  _$jscoverage['/combobox/control.js'].lineData[227] = 0;
  _$jscoverage['/combobox/control.js'].lineData[229] = 0;
  _$jscoverage['/combobox/control.js'].lineData[230] = 0;
  _$jscoverage['/combobox/control.js'].lineData[234] = 0;
  _$jscoverage['/combobox/control.js'].lineData[235] = 0;
  _$jscoverage['/combobox/control.js'].lineData[237] = 0;
  _$jscoverage['/combobox/control.js'].lineData[238] = 0;
  _$jscoverage['/combobox/control.js'].lineData[239] = 0;
  _$jscoverage['/combobox/control.js'].lineData[240] = 0;
  _$jscoverage['/combobox/control.js'].lineData[243] = 0;
  _$jscoverage['/combobox/control.js'].lineData[247] = 0;
  _$jscoverage['/combobox/control.js'].lineData[251] = 0;
  _$jscoverage['/combobox/control.js'].lineData[252] = 0;
  _$jscoverage['/combobox/control.js'].lineData[253] = 0;
  _$jscoverage['/combobox/control.js'].lineData[256] = 0;
  _$jscoverage['/combobox/control.js'].lineData[265] = 0;
  _$jscoverage['/combobox/control.js'].lineData[267] = 0;
  _$jscoverage['/combobox/control.js'].lineData[271] = 0;
  _$jscoverage['/combobox/control.js'].lineData[274] = 0;
  _$jscoverage['/combobox/control.js'].lineData[275] = 0;
  _$jscoverage['/combobox/control.js'].lineData[278] = 0;
  _$jscoverage['/combobox/control.js'].lineData[279] = 0;
  _$jscoverage['/combobox/control.js'].lineData[280] = 0;
  _$jscoverage['/combobox/control.js'].lineData[281] = 0;
  _$jscoverage['/combobox/control.js'].lineData[282] = 0;
  _$jscoverage['/combobox/control.js'].lineData[283] = 0;
  _$jscoverage['/combobox/control.js'].lineData[286] = 0;
  _$jscoverage['/combobox/control.js'].lineData[288] = 0;
  _$jscoverage['/combobox/control.js'].lineData[397] = 0;
  _$jscoverage['/combobox/control.js'].lineData[398] = 0;
  _$jscoverage['/combobox/control.js'].lineData[399] = 0;
  _$jscoverage['/combobox/control.js'].lineData[400] = 0;
  _$jscoverage['/combobox/control.js'].lineData[402] = 0;
  _$jscoverage['/combobox/control.js'].lineData[405] = 0;
  _$jscoverage['/combobox/control.js'].lineData[406] = 0;
  _$jscoverage['/combobox/control.js'].lineData[407] = 0;
  _$jscoverage['/combobox/control.js'].lineData[415] = 0;
  _$jscoverage['/combobox/control.js'].lineData[523] = 0;
  _$jscoverage['/combobox/control.js'].lineData[524] = 0;
  _$jscoverage['/combobox/control.js'].lineData[525] = 0;
  _$jscoverage['/combobox/control.js'].lineData[526] = 0;
  _$jscoverage['/combobox/control.js'].lineData[529] = 0;
  _$jscoverage['/combobox/control.js'].lineData[532] = 0;
  _$jscoverage['/combobox/control.js'].lineData[533] = 0;
  _$jscoverage['/combobox/control.js'].lineData[535] = 0;
  _$jscoverage['/combobox/control.js'].lineData[538] = 0;
  _$jscoverage['/combobox/control.js'].lineData[539] = 0;
  _$jscoverage['/combobox/control.js'].lineData[544] = 0;
  _$jscoverage['/combobox/control.js'].lineData[545] = 0;
  _$jscoverage['/combobox/control.js'].lineData[549] = 0;
  _$jscoverage['/combobox/control.js'].lineData[550] = 0;
  _$jscoverage['/combobox/control.js'].lineData[552] = 0;
  _$jscoverage['/combobox/control.js'].lineData[554] = 0;
  _$jscoverage['/combobox/control.js'].lineData[557] = 0;
  _$jscoverage['/combobox/control.js'].lineData[558] = 0;
  _$jscoverage['/combobox/control.js'].lineData[562] = 0;
  _$jscoverage['/combobox/control.js'].lineData[567] = 0;
  _$jscoverage['/combobox/control.js'].lineData[568] = 0;
  _$jscoverage['/combobox/control.js'].lineData[569] = 0;
  _$jscoverage['/combobox/control.js'].lineData[570] = 0;
  _$jscoverage['/combobox/control.js'].lineData[571] = 0;
  _$jscoverage['/combobox/control.js'].lineData[572] = 0;
  _$jscoverage['/combobox/control.js'].lineData[574] = 0;
  _$jscoverage['/combobox/control.js'].lineData[575] = 0;
  _$jscoverage['/combobox/control.js'].lineData[576] = 0;
  _$jscoverage['/combobox/control.js'].lineData[579] = 0;
  _$jscoverage['/combobox/control.js'].lineData[582] = 0;
  _$jscoverage['/combobox/control.js'].lineData[583] = 0;
  _$jscoverage['/combobox/control.js'].lineData[586] = 0;
  _$jscoverage['/combobox/control.js'].lineData[587] = 0;
  _$jscoverage['/combobox/control.js'].lineData[588] = 0;
  _$jscoverage['/combobox/control.js'].lineData[589] = 0;
  _$jscoverage['/combobox/control.js'].lineData[590] = 0;
  _$jscoverage['/combobox/control.js'].lineData[594] = 0;
  _$jscoverage['/combobox/control.js'].lineData[595] = 0;
  _$jscoverage['/combobox/control.js'].lineData[598] = 0;
  _$jscoverage['/combobox/control.js'].lineData[599] = 0;
  _$jscoverage['/combobox/control.js'].lineData[600] = 0;
  _$jscoverage['/combobox/control.js'].lineData[601] = 0;
  _$jscoverage['/combobox/control.js'].lineData[603] = 0;
  _$jscoverage['/combobox/control.js'].lineData[604] = 0;
  _$jscoverage['/combobox/control.js'].lineData[608] = 0;
  _$jscoverage['/combobox/control.js'].lineData[609] = 0;
  _$jscoverage['/combobox/control.js'].lineData[610] = 0;
  _$jscoverage['/combobox/control.js'].lineData[612] = 0;
  _$jscoverage['/combobox/control.js'].lineData[615] = 0;
  _$jscoverage['/combobox/control.js'].lineData[616] = 0;
  _$jscoverage['/combobox/control.js'].lineData[624] = 0;
  _$jscoverage['/combobox/control.js'].lineData[625] = 0;
  _$jscoverage['/combobox/control.js'].lineData[626] = 0;
  _$jscoverage['/combobox/control.js'].lineData[628] = 0;
  _$jscoverage['/combobox/control.js'].lineData[629] = 0;
  _$jscoverage['/combobox/control.js'].lineData[633] = 0;
  _$jscoverage['/combobox/control.js'].lineData[634] = 0;
  _$jscoverage['/combobox/control.js'].lineData[641] = 0;
  _$jscoverage['/combobox/control.js'].lineData[642] = 0;
  _$jscoverage['/combobox/control.js'].lineData[651] = 0;
  _$jscoverage['/combobox/control.js'].lineData[653] = 0;
  _$jscoverage['/combobox/control.js'].lineData[654] = 0;
  _$jscoverage['/combobox/control.js'].lineData[656] = 0;
  _$jscoverage['/combobox/control.js'].lineData[658] = 0;
  _$jscoverage['/combobox/control.js'].lineData[659] = 0;
  _$jscoverage['/combobox/control.js'].lineData[662] = 0;
  _$jscoverage['/combobox/control.js'].lineData[663] = 0;
  _$jscoverage['/combobox/control.js'].lineData[664] = 0;
  _$jscoverage['/combobox/control.js'].lineData[665] = 0;
  _$jscoverage['/combobox/control.js'].lineData[668] = 0;
  _$jscoverage['/combobox/control.js'].lineData[671] = 0;
  _$jscoverage['/combobox/control.js'].lineData[673] = 0;
  _$jscoverage['/combobox/control.js'].lineData[674] = 0;
  _$jscoverage['/combobox/control.js'].lineData[675] = 0;
  _$jscoverage['/combobox/control.js'].lineData[676] = 0;
  _$jscoverage['/combobox/control.js'].lineData[677] = 0;
  _$jscoverage['/combobox/control.js'].lineData[678] = 0;
  _$jscoverage['/combobox/control.js'].lineData[684] = 0;
  _$jscoverage['/combobox/control.js'].lineData[685] = 0;
  _$jscoverage['/combobox/control.js'].lineData[686] = 0;
  _$jscoverage['/combobox/control.js'].lineData[687] = 0;
  _$jscoverage['/combobox/control.js'].lineData[688] = 0;
  _$jscoverage['/combobox/control.js'].lineData[693] = 0;
  _$jscoverage['/combobox/control.js'].lineData[694] = 0;
  _$jscoverage['/combobox/control.js'].lineData[696] = 0;
  _$jscoverage['/combobox/control.js'].lineData[702] = 0;
}
if (! _$jscoverage['/combobox/control.js'].functionData) {
  _$jscoverage['/combobox/control.js'].functionData = [];
  _$jscoverage['/combobox/control.js'].functionData[0] = 0;
  _$jscoverage['/combobox/control.js'].functionData[1] = 0;
  _$jscoverage['/combobox/control.js'].functionData[2] = 0;
  _$jscoverage['/combobox/control.js'].functionData[3] = 0;
  _$jscoverage['/combobox/control.js'].functionData[4] = 0;
  _$jscoverage['/combobox/control.js'].functionData[5] = 0;
  _$jscoverage['/combobox/control.js'].functionData[6] = 0;
  _$jscoverage['/combobox/control.js'].functionData[7] = 0;
  _$jscoverage['/combobox/control.js'].functionData[8] = 0;
  _$jscoverage['/combobox/control.js'].functionData[9] = 0;
  _$jscoverage['/combobox/control.js'].functionData[10] = 0;
  _$jscoverage['/combobox/control.js'].functionData[11] = 0;
  _$jscoverage['/combobox/control.js'].functionData[12] = 0;
  _$jscoverage['/combobox/control.js'].functionData[13] = 0;
  _$jscoverage['/combobox/control.js'].functionData[14] = 0;
  _$jscoverage['/combobox/control.js'].functionData[15] = 0;
  _$jscoverage['/combobox/control.js'].functionData[16] = 0;
  _$jscoverage['/combobox/control.js'].functionData[17] = 0;
  _$jscoverage['/combobox/control.js'].functionData[18] = 0;
  _$jscoverage['/combobox/control.js'].functionData[19] = 0;
  _$jscoverage['/combobox/control.js'].functionData[20] = 0;
  _$jscoverage['/combobox/control.js'].functionData[21] = 0;
  _$jscoverage['/combobox/control.js'].functionData[22] = 0;
  _$jscoverage['/combobox/control.js'].functionData[23] = 0;
  _$jscoverage['/combobox/control.js'].functionData[24] = 0;
  _$jscoverage['/combobox/control.js'].functionData[25] = 0;
  _$jscoverage['/combobox/control.js'].functionData[26] = 0;
  _$jscoverage['/combobox/control.js'].functionData[27] = 0;
  _$jscoverage['/combobox/control.js'].functionData[28] = 0;
  _$jscoverage['/combobox/control.js'].functionData[29] = 0;
  _$jscoverage['/combobox/control.js'].functionData[30] = 0;
  _$jscoverage['/combobox/control.js'].functionData[31] = 0;
  _$jscoverage['/combobox/control.js'].functionData[32] = 0;
}
if (! _$jscoverage['/combobox/control.js'].branchData) {
  _$jscoverage['/combobox/control.js'].branchData = {};
  _$jscoverage['/combobox/control.js'].branchData['31'] = [];
  _$jscoverage['/combobox/control.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['33'] = [];
  _$jscoverage['/combobox/control.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['39'] = [];
  _$jscoverage['/combobox/control.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['100'] = [];
  _$jscoverage['/combobox/control.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['103'] = [];
  _$jscoverage['/combobox/control.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['119'] = [];
  _$jscoverage['/combobox/control.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['122'] = [];
  _$jscoverage['/combobox/control.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['133'] = [];
  _$jscoverage['/combobox/control.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['135'] = [];
  _$jscoverage['/combobox/control.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['136'] = [];
  _$jscoverage['/combobox/control.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['136'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['144'] = [];
  _$jscoverage['/combobox/control.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['156'] = [];
  _$jscoverage['/combobox/control.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['156'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['156'][3] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['157'] = [];
  _$jscoverage['/combobox/control.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['181'] = [];
  _$jscoverage['/combobox/control.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['187'] = [];
  _$jscoverage['/combobox/control.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['189'] = [];
  _$jscoverage['/combobox/control.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['189'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['189'][3] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['190'] = [];
  _$jscoverage['/combobox/control.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['192'] = [];
  _$jscoverage['/combobox/control.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['192'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['193'] = [];
  _$jscoverage['/combobox/control.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['206'] = [];
  _$jscoverage['/combobox/control.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['208'] = [];
  _$jscoverage['/combobox/control.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['217'] = [];
  _$jscoverage['/combobox/control.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['225'] = [];
  _$jscoverage['/combobox/control.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['225'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['229'] = [];
  _$jscoverage['/combobox/control.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['235'] = [];
  _$jscoverage['/combobox/control.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['235'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['235'][3] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['238'] = [];
  _$jscoverage['/combobox/control.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['251'] = [];
  _$jscoverage['/combobox/control.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['274'] = [];
  _$jscoverage['/combobox/control.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['279'] = [];
  _$jscoverage['/combobox/control.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['280'] = [];
  _$jscoverage['/combobox/control.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['284'] = [];
  _$jscoverage['/combobox/control.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['285'] = [];
  _$jscoverage['/combobox/control.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['397'] = [];
  _$jscoverage['/combobox/control.js'].branchData['397'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['398'] = [];
  _$jscoverage['/combobox/control.js'].branchData['398'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['405'] = [];
  _$jscoverage['/combobox/control.js'].branchData['405'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['524'] = [];
  _$jscoverage['/combobox/control.js'].branchData['524'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['525'] = [];
  _$jscoverage['/combobox/control.js'].branchData['525'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['586'] = [];
  _$jscoverage['/combobox/control.js'].branchData['586'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['598'] = [];
  _$jscoverage['/combobox/control.js'].branchData['598'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['609'] = [];
  _$jscoverage['/combobox/control.js'].branchData['609'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['615'] = [];
  _$jscoverage['/combobox/control.js'].branchData['615'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['626'] = [];
  _$jscoverage['/combobox/control.js'].branchData['626'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['658'] = [];
  _$jscoverage['/combobox/control.js'].branchData['658'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['662'] = [];
  _$jscoverage['/combobox/control.js'].branchData['662'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['663'] = [];
  _$jscoverage['/combobox/control.js'].branchData['663'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['673'] = [];
  _$jscoverage['/combobox/control.js'].branchData['673'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['674'] = [];
  _$jscoverage['/combobox/control.js'].branchData['674'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['675'] = [];
  _$jscoverage['/combobox/control.js'].branchData['675'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['684'] = [];
  _$jscoverage['/combobox/control.js'].branchData['684'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['685'] = [];
  _$jscoverage['/combobox/control.js'].branchData['685'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['686'] = [];
  _$jscoverage['/combobox/control.js'].branchData['686'][1] = new BranchData();
}
_$jscoverage['/combobox/control.js'].branchData['686'][1].init(26, 28, '!children[i].get("disabled")');
function visit60_686_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['686'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['685'][1].init(30, 19, 'i < children.length');
function visit59_685_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['685'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['684'][1].init(777, 43, '!matchVal && self.get("autoHighlightFirst")');
function visit58_684_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['684'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['675'][1].init(26, 37, 'children[i].get("textContent") == val');
function visit57_675_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['675'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['674'][1].init(30, 19, 'i < children.length');
function visit56_674_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['674'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['673'][1].init(328, 30, 'self.get(\'highlightMatchItem\')');
function visit55_673_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['673'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['663'][1].init(26, 15, 'i < data.length');
function visit54_663_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['663'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['662'][1].init(501, 19, 'data && data.length');
function visit53_662_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['662'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['658'][1].init(370, 45, 'highlightedItem = menu.get(\'highlightedItem\')');
function visit52_658_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['658'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['626'][1].init(30, 30, 't = self._focusoutDismissTimer');
function visit51_626_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['626'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['615'][1].init(124, 26, 'self._focusoutDismissTimer');
function visit50_615_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['615'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['609'][1].init(14, 26, 'self._focusoutDismissTimer');
function visit49_609_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['609'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['598'][1].init(150, 5, 'error');
function visit48_598_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['598'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['586'][1].init(96, 15, 'item.isMenuItem');
function visit47_586_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['586'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['525'][1].init(18, 28, '!children[i].get(\'disabled\')');
function visit46_525_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['525'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['524'][1].init(26, 19, 'i < children.length');
function visit45_524_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['524'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['405'][1].init(30, 11, 'm.isControl');
function visit44_405_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['398'][1].init(41, 23, 'v.xclass || \'popupmenu\'');
function visit43_398_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['398'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['397'][1].init(30, 12, '!v.isControl');
function visit42_397_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['397'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['285'][1].init(85, 45, 'parseInt(menuEl.css(\'borderRightWidth\')) || 0');
function visit41_285_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['284'][1].init(47, 44, 'parseInt(menuEl.css(\'borderLeftWidth\')) || 0');
function visit40_284_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['280'][1].init(30, 24, 'self.get("matchElWidth")');
function visit39_280_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['279'][1].init(119, 20, '!menu.get("visible")');
function visit38_279_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['274'][1].init(138, 1, 'v');
function visit37_274_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['251'][1].init(173, 9, 'validator');
function visit36_251_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['238'][1].init(145, 15, 'v !== undefined');
function visit35_238_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['235'][3].init(3024, 21, 'keyCode == KeyCode.UP');
function visit34_235_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['235'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['235'][2].init(2997, 23, 'keyCode == KeyCode.DOWN');
function visit33_235_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['235'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['235'][1].init(2997, 48, 'keyCode == KeyCode.DOWN || keyCode == KeyCode.UP');
function visit32_235_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['229'][1].init(215, 20, 'self.get("multiple")');
function visit31_229_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['225'][2].init(2118, 22, 'keyCode == KeyCode.TAB');
function visit30_225_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['225'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['225'][1].init(2118, 41, 'keyCode == KeyCode.TAB && highlightedItem');
function visit29_225_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['217'][1].init(1681, 94, 'updateInputOnDownUp && S.inArray(keyCode, [KeyCode.DOWN, KeyCode.UP])');
function visit28_217_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['208'][1].init(84, 19, 'updateInputOnDownUp');
function visit27_208_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['206'][1].init(1156, 22, 'keyCode == KeyCode.ESC');
function visit26_206_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['193'][1].init(57, 52, 'highlightedItem == getFirstEnabledItem(menuChildren)');
function visit25_193_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['192'][2].init(287, 21, 'keyCode == KeyCode.UP');
function visit24_192_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['192'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['192'][1].init(188, 110, 'keyCode == KeyCode.UP && highlightedItem == getFirstEnabledItem(menuChildren)');
function visit23_192_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['190'][1].init(55, 71, 'highlightedItem == getFirstEnabledItem(menuChildren.concat().reverse())');
function visit22_190_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['189'][3].init(96, 23, 'keyCode == KeyCode.DOWN');
function visit21_189_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['189'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['189'][2].init(96, 127, 'keyCode == KeyCode.DOWN && highlightedItem == getFirstEnabledItem(menuChildren.concat().reverse())');
function visit20_189_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['189'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['189'][1].init(96, 299, 'keyCode == KeyCode.DOWN && highlightedItem == getFirstEnabledItem(menuChildren.concat().reverse()) || keyCode == KeyCode.UP && highlightedItem == getFirstEnabledItem(menuChildren)');
function visit19_189_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['187'][1].init(249, 38, 'updateInputOnDownUp && highlightedItem');
function visit18_187_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['181'][1].init(408, 19, 'menu.get("visible")');
function visit17_181_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['157'][1].init(26, 21, 'self.get(\'collapsed\')');
function visit16_157_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['156'][3].init(247, 20, 'trigger[0] == target');
function visit15_156_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['156'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['156'][2].init(247, 48, 'trigger[0] == target || trigger.contains(target)');
function visit14_156_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['156'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['156'][1].init(235, 61, 'trigger && (trigger[0] == target || trigger.contains(target))');
function visit13_156_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['144'][1].init(701, 35, 'placeholderEl && !self.get(\'value\')');
function visit12_144_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['136'][2].init(58, 24, 'val == self.get(\'value\')');
function visit11_136_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['136'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['136'][1].init(34, 48, '!self.get("focused") && val == self.get(\'value\')');
function visit10_136_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['135'][1].init(30, 5, 'error');
function visit9_135_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['133'][1].init(225, 21, 'self.get(\'invalidEl\')');
function visit8_133_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['122'][1].init(203, 41, 'placeholderEl = self.get("placeholderEl")');
function visit7_122_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['119'][1].init(92, 21, 'self.get(\'invalidEl\')');
function visit6_119_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['103'][1].init(150, 19, 'value === undefined');
function visit5_103_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['100'][1].init(146, 15, 'e.causedByTimer');
function visit4_100_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['39'][1].init(377, 15, 'i < data.length');
function visit3_39_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['33'][1].init(95, 18, 'self.get("format")');
function visit2_33_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['31'][1].init(96, 19, 'data && data.length');
function visit1_31_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].lineData[6]++;
KISSY.add("combobox/control", function(S, Node, Control, ComboBoxRender, Menu, undefined) {
  _$jscoverage['/combobox/control.js'].functionData[0]++;
  _$jscoverage['/combobox/control.js'].lineData[7]++;
  var ComboBox, KeyCode = Node.KeyCode;
  _$jscoverage['/combobox/control.js'].lineData[16]++;
  ComboBox = Control.extend({
  _savedValue: null, 
  'normalizeData': function(data) {
  _$jscoverage['/combobox/control.js'].functionData[1]++;
  _$jscoverage['/combobox/control.js'].lineData[29]++;
  var self = this, contents, v, i, c;
  _$jscoverage['/combobox/control.js'].lineData[31]++;
  if (visit1_31_1(data && data.length)) {
    _$jscoverage['/combobox/control.js'].lineData[32]++;
    data = data.slice(0, self.get("maxItemCount"));
    _$jscoverage['/combobox/control.js'].lineData[33]++;
    if (visit2_33_1(self.get("format"))) {
      _$jscoverage['/combobox/control.js'].lineData[34]++;
      contents = self.get("format").call(self, self.getValueForAutocomplete(), data);
    } else {
      _$jscoverage['/combobox/control.js'].lineData[37]++;
      contents = [];
    }
    _$jscoverage['/combobox/control.js'].lineData[39]++;
    for (i = 0; visit3_39_1(i < data.length); i++) {
      _$jscoverage['/combobox/control.js'].lineData[40]++;
      v = data[i];
      _$jscoverage['/combobox/control.js'].lineData[41]++;
      c = contents[i] = S.mix({
  content: v, 
  textContent: v, 
  value: v}, contents[i]);
    }
    _$jscoverage['/combobox/control.js'].lineData[47]++;
    return contents;
  }
  _$jscoverage['/combobox/control.js'].lineData[49]++;
  return contents;
}, 
  bindUI: function() {
  _$jscoverage['/combobox/control.js'].functionData[2]++;
  _$jscoverage['/combobox/control.js'].lineData[53]++;
  var self = this, input = self.get("input");
  _$jscoverage['/combobox/control.js'].lineData[56]++;
  input.on("valuechange", onValueChange, self);
  _$jscoverage['/combobox/control.js'].lineData[66]++;
  self.on('click', onMenuItemClick, self);
  _$jscoverage['/combobox/control.js'].lineData[68]++;
  self.get('menu').onRendered(function(menu) {
  _$jscoverage['/combobox/control.js'].functionData[3]++;
  _$jscoverage['/combobox/control.js'].lineData[69]++;
  onMenuAfterRenderUI(self, menu);
});
}, 
  destructor: function() {
  _$jscoverage['/combobox/control.js'].functionData[4]++;
  _$jscoverage['/combobox/control.js'].lineData[74]++;
  this.get('menu').destroy();
}, 
  getValueForAutocomplete: function() {
  _$jscoverage['/combobox/control.js'].functionData[5]++;
  _$jscoverage['/combobox/control.js'].lineData[82]++;
  return this.get('value');
}, 
  setValueFromAutocomplete: function(value, setCfg) {
  _$jscoverage['/combobox/control.js'].functionData[6]++;
  _$jscoverage['/combobox/control.js'].lineData[92]++;
  this.set('value', value, setCfg);
}, 
  '_onSetValue': function(v, e) {
  _$jscoverage['/combobox/control.js'].functionData[7]++;
  _$jscoverage['/combobox/control.js'].lineData[97]++;
  var self = this, value;
  _$jscoverage['/combobox/control.js'].lineData[100]++;
  if (visit4_100_1(e.causedByTimer)) {
    _$jscoverage['/combobox/control.js'].lineData[101]++;
    value = self['getValueForAutocomplete']();
    _$jscoverage['/combobox/control.js'].lineData[103]++;
    if (visit5_103_1(value === undefined)) {
      _$jscoverage['/combobox/control.js'].lineData[104]++;
      self.set("collapsed", true);
      _$jscoverage['/combobox/control.js'].lineData[105]++;
      return;
    }
    _$jscoverage['/combobox/control.js'].lineData[107]++;
    self._savedValue = value;
    _$jscoverage['/combobox/control.js'].lineData[109]++;
    self.sendRequest(value);
  } else {
    _$jscoverage['/combobox/control.js'].lineData[112]++;
    self.get('input').val(v);
  }
}, 
  handleFocusInternal: function() {
  _$jscoverage['/combobox/control.js'].functionData[8]++;
  _$jscoverage['/combobox/control.js'].lineData[117]++;
  var self = this, placeholderEl;
  _$jscoverage['/combobox/control.js'].lineData[119]++;
  if (visit6_119_1(self.get('invalidEl'))) {
    _$jscoverage['/combobox/control.js'].lineData[120]++;
    setInvalid(self, false);
  }
  _$jscoverage['/combobox/control.js'].lineData[122]++;
  if (visit7_122_1(placeholderEl = self.get("placeholderEl"))) {
    _$jscoverage['/combobox/control.js'].lineData[123]++;
    placeholderEl.hide();
  }
}, 
  handleBlurInternal: function(e) {
  _$jscoverage['/combobox/control.js'].functionData[9]++;
  _$jscoverage['/combobox/control.js'].lineData[129]++;
  var self = this, placeholderEl = self.get("placeholderEl");
  _$jscoverage['/combobox/control.js'].lineData[131]++;
  self.callSuper(e);
  _$jscoverage['/combobox/control.js'].lineData[132]++;
  delayHide(self);
  _$jscoverage['/combobox/control.js'].lineData[133]++;
  if (visit8_133_1(self.get('invalidEl'))) {
    _$jscoverage['/combobox/control.js'].lineData[134]++;
    self.validate(function(error, val) {
  _$jscoverage['/combobox/control.js'].functionData[10]++;
  _$jscoverage['/combobox/control.js'].lineData[135]++;
  if (visit9_135_1(error)) {
    _$jscoverage['/combobox/control.js'].lineData[136]++;
    if (visit10_136_1(!self.get("focused") && visit11_136_2(val == self.get('value')))) {
      _$jscoverage['/combobox/control.js'].lineData[137]++;
      setInvalid(self, error);
    }
  } else {
    _$jscoverage['/combobox/control.js'].lineData[140]++;
    setInvalid(self, false);
  }
});
  }
  _$jscoverage['/combobox/control.js'].lineData[144]++;
  if (visit12_144_1(placeholderEl && !self.get('value'))) {
    _$jscoverage['/combobox/control.js'].lineData[145]++;
    placeholderEl.show();
  }
}, 
  handleMouseDownInternal: function(e) {
  _$jscoverage['/combobox/control.js'].functionData[11]++;
  _$jscoverage['/combobox/control.js'].lineData[150]++;
  var self = this, target, trigger;
  _$jscoverage['/combobox/control.js'].lineData[153]++;
  self.callSuper(e);
  _$jscoverage['/combobox/control.js'].lineData[154]++;
  target = e.target;
  _$jscoverage['/combobox/control.js'].lineData[155]++;
  trigger = self.get("trigger");
  _$jscoverage['/combobox/control.js'].lineData[156]++;
  if (visit13_156_1(trigger && (visit14_156_2(visit15_156_3(trigger[0] == target) || trigger.contains(target))))) {
    _$jscoverage['/combobox/control.js'].lineData[157]++;
    if (visit16_157_1(self.get('collapsed'))) {
      _$jscoverage['/combobox/control.js'].lineData[159]++;
      self.focus();
      _$jscoverage['/combobox/control.js'].lineData[160]++;
      self.sendRequest('');
    } else {
      _$jscoverage['/combobox/control.js'].lineData[163]++;
      self.set('collapsed', true);
    }
    _$jscoverage['/combobox/control.js'].lineData[165]++;
    e.preventDefault();
  }
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/combobox/control.js'].functionData[12]++;
  _$jscoverage['/combobox/control.js'].lineData[170]++;
  var self = this, updateInputOnDownUp, input, keyCode = e.keyCode, highlightedItem, handledByMenu, menu = self.get("menu");
  _$jscoverage['/combobox/control.js'].lineData[178]++;
  input = self.get("input");
  _$jscoverage['/combobox/control.js'].lineData[179]++;
  updateInputOnDownUp = self.get("updateInputOnDownUp");
  _$jscoverage['/combobox/control.js'].lineData[181]++;
  if (visit17_181_1(menu.get("visible"))) {
    _$jscoverage['/combobox/control.js'].lineData[183]++;
    highlightedItem = menu.get("highlightedItem");
    _$jscoverage['/combobox/control.js'].lineData[187]++;
    if (visit18_187_1(updateInputOnDownUp && highlightedItem)) {
      _$jscoverage['/combobox/control.js'].lineData[188]++;
      var menuChildren = menu.get('children');
      _$jscoverage['/combobox/control.js'].lineData[189]++;
      if (visit19_189_1(visit20_189_2(visit21_189_3(keyCode == KeyCode.DOWN) && visit22_190_1(highlightedItem == getFirstEnabledItem(menuChildren.concat().reverse()))) || visit23_192_1(visit24_192_2(keyCode == KeyCode.UP) && visit25_193_1(highlightedItem == getFirstEnabledItem(menuChildren))))) {
        _$jscoverage['/combobox/control.js'].lineData[195]++;
        self.setValueFromAutocomplete(self._savedValue);
        _$jscoverage['/combobox/control.js'].lineData[196]++;
        highlightedItem.set('highlighted', false);
        _$jscoverage['/combobox/control.js'].lineData[197]++;
        return true;
      }
    }
    _$jscoverage['/combobox/control.js'].lineData[201]++;
    handledByMenu = menu.handleKeyDownInternal(e);
    _$jscoverage['/combobox/control.js'].lineData[203]++;
    highlightedItem = menu.get("highlightedItem");
    _$jscoverage['/combobox/control.js'].lineData[206]++;
    if (visit26_206_1(keyCode == KeyCode.ESC)) {
      _$jscoverage['/combobox/control.js'].lineData[207]++;
      self.set("collapsed", true);
      _$jscoverage['/combobox/control.js'].lineData[208]++;
      if (visit27_208_1(updateInputOnDownUp)) {
        _$jscoverage['/combobox/control.js'].lineData[212]++;
        self.setValueFromAutocomplete(self._savedValue);
      }
      _$jscoverage['/combobox/control.js'].lineData[214]++;
      return true;
    }
    _$jscoverage['/combobox/control.js'].lineData[217]++;
    if (visit28_217_1(updateInputOnDownUp && S.inArray(keyCode, [KeyCode.DOWN, KeyCode.UP]))) {
      _$jscoverage['/combobox/control.js'].lineData[220]++;
      self.setValueFromAutocomplete(highlightedItem.get("textContent"));
    }
    _$jscoverage['/combobox/control.js'].lineData[225]++;
    if (visit29_225_1(visit30_225_2(keyCode == KeyCode.TAB) && highlightedItem)) {
      _$jscoverage['/combobox/control.js'].lineData[227]++;
      highlightedItem.handleClickInternal();
      _$jscoverage['/combobox/control.js'].lineData[229]++;
      if (visit31_229_1(self.get("multiple"))) {
        _$jscoverage['/combobox/control.js'].lineData[230]++;
        return true;
      }
    }
    _$jscoverage['/combobox/control.js'].lineData[234]++;
    return handledByMenu;
  } else {
    _$jscoverage['/combobox/control.js'].lineData[235]++;
    if (visit32_235_1(visit33_235_2(keyCode == KeyCode.DOWN) || visit34_235_3(keyCode == KeyCode.UP))) {
      _$jscoverage['/combobox/control.js'].lineData[237]++;
      var v = self.getValueForAutocomplete();
      _$jscoverage['/combobox/control.js'].lineData[238]++;
      if (visit35_238_1(v !== undefined)) {
        _$jscoverage['/combobox/control.js'].lineData[239]++;
        self.sendRequest(v);
        _$jscoverage['/combobox/control.js'].lineData[240]++;
        return true;
      }
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[243]++;
  return undefined;
}, 
  validate: function(callback) {
  _$jscoverage['/combobox/control.js'].functionData[13]++;
  _$jscoverage['/combobox/control.js'].lineData[247]++;
  var self = this, validator = self.get('validator'), val = self.getValueForAutocomplete();
  _$jscoverage['/combobox/control.js'].lineData[251]++;
  if (visit36_251_1(validator)) {
    _$jscoverage['/combobox/control.js'].lineData[252]++;
    validator(val, function(error) {
  _$jscoverage['/combobox/control.js'].functionData[14]++;
  _$jscoverage['/combobox/control.js'].lineData[253]++;
  callback(error, val);
});
  } else {
    _$jscoverage['/combobox/control.js'].lineData[256]++;
    callback(false, val);
  }
}, 
  sendRequest: function(value) {
  _$jscoverage['/combobox/control.js'].functionData[15]++;
  _$jscoverage['/combobox/control.js'].lineData[265]++;
  var self = this, dataSource = self.get("dataSource");
  _$jscoverage['/combobox/control.js'].lineData[267]++;
  dataSource.fetchData(value, renderData, self);
}, 
  _onSetCollapsed: function(v) {
  _$jscoverage['/combobox/control.js'].functionData[16]++;
  _$jscoverage['/combobox/control.js'].lineData[271]++;
  var self = this, el = self.$el, menu = self.get('menu');
  _$jscoverage['/combobox/control.js'].lineData[274]++;
  if (visit37_274_1(v)) {
    _$jscoverage['/combobox/control.js'].lineData[275]++;
    menu.hide();
  } else {
    _$jscoverage['/combobox/control.js'].lineData[278]++;
    clearDismissTimer(self);
    _$jscoverage['/combobox/control.js'].lineData[279]++;
    if (visit38_279_1(!menu.get("visible"))) {
      _$jscoverage['/combobox/control.js'].lineData[280]++;
      if (visit39_280_1(self.get("matchElWidth"))) {
        _$jscoverage['/combobox/control.js'].lineData[281]++;
        menu.render();
        _$jscoverage['/combobox/control.js'].lineData[282]++;
        var menuEl = menu.get('el');
        _$jscoverage['/combobox/control.js'].lineData[283]++;
        var borderWidth = (visit40_284_1(parseInt(menuEl.css('borderLeftWidth')) || 0)) + (visit41_285_1(parseInt(menuEl.css('borderRightWidth')) || 0));
        _$jscoverage['/combobox/control.js'].lineData[286]++;
        menu.set("width", el[0].offsetWidth - borderWidth);
      }
      _$jscoverage['/combobox/control.js'].lineData[288]++;
      menu.show();
    }
  }
}}, {
  ATTRS: {
  input: {}, 
  value: {
  value: '', 
  sync: 0, 
  view: 1}, 
  trigger: {}, 
  placeholder: {
  view: 1}, 
  placeholderEl: {}, 
  validator: {}, 
  invalidEl: {}, 
  allowTextSelection: {
  value: true}, 
  hasTrigger: {
  value: true, 
  view: 1}, 
  menu: {
  value: {}, 
  getter: function(v) {
  _$jscoverage['/combobox/control.js'].functionData[17]++;
  _$jscoverage['/combobox/control.js'].lineData[397]++;
  if (visit42_397_1(!v.isControl)) {
    _$jscoverage['/combobox/control.js'].lineData[398]++;
    v.xclass = visit43_398_1(v.xclass || 'popupmenu');
    _$jscoverage['/combobox/control.js'].lineData[399]++;
    v = this.createComponent(v);
    _$jscoverage['/combobox/control.js'].lineData[400]++;
    this.setInternal('menu', v);
  }
  _$jscoverage['/combobox/control.js'].lineData[402]++;
  return v;
}, 
  setter: function(m) {
  _$jscoverage['/combobox/control.js'].functionData[18]++;
  _$jscoverage['/combobox/control.js'].lineData[405]++;
  if (visit44_405_1(m.isControl)) {
    _$jscoverage['/combobox/control.js'].lineData[406]++;
    m.setInternal('parent', this);
    _$jscoverage['/combobox/control.js'].lineData[407]++;
    var align = {
  node: this.$el, 
  points: ["bl", "tl"], 
  overflow: {
  adjustX: 1, 
  adjustY: 1}};
    _$jscoverage['/combobox/control.js'].lineData[415]++;
    S.mix(m.get('align'), align, false);
  }
}}, 
  collapsed: {
  view: 1, 
  value: true}, 
  dataSource: {}, 
  maxItemCount: {
  value: 99999}, 
  matchElWidth: {
  value: true}, 
  format: {}, 
  updateInputOnDownUp: {
  value: true}, 
  autoHighlightFirst: {}, 
  highlightMatchItem: {
  value: true}, 
  xrender: {
  value: ComboBoxRender}}, 
  xclass: 'combobox'});
  _$jscoverage['/combobox/control.js'].lineData[523]++;
  function getFirstEnabledItem(children) {
    _$jscoverage['/combobox/control.js'].functionData[19]++;
    _$jscoverage['/combobox/control.js'].lineData[524]++;
    for (var i = 0; visit45_524_1(i < children.length); i++) {
      _$jscoverage['/combobox/control.js'].lineData[525]++;
      if (visit46_525_1(!children[i].get('disabled'))) {
        _$jscoverage['/combobox/control.js'].lineData[526]++;
        return children[i];
      }
    }
    _$jscoverage['/combobox/control.js'].lineData[529]++;
    return null;
  }
  _$jscoverage['/combobox/control.js'].lineData[532]++;
  function onMenuFocusout() {
    _$jscoverage['/combobox/control.js'].functionData[20]++;
    _$jscoverage['/combobox/control.js'].lineData[533]++;
    var combobox = this;
    _$jscoverage['/combobox/control.js'].lineData[535]++;
    delayHide(combobox);
  }
  _$jscoverage['/combobox/control.js'].lineData[538]++;
  function onMenuFocusin() {
    _$jscoverage['/combobox/control.js'].functionData[21]++;
    _$jscoverage['/combobox/control.js'].lineData[539]++;
    var combobox = this;
    _$jscoverage['/combobox/control.js'].lineData[544]++;
    setTimeout(function() {
  _$jscoverage['/combobox/control.js'].functionData[22]++;
  _$jscoverage['/combobox/control.js'].lineData[545]++;
  clearDismissTimer(combobox);
}, 0);
  }
  _$jscoverage['/combobox/control.js'].lineData[549]++;
  function onMenuMouseOver() {
    _$jscoverage['/combobox/control.js'].functionData[23]++;
    _$jscoverage['/combobox/control.js'].lineData[550]++;
    var combobox = this;
    _$jscoverage['/combobox/control.js'].lineData[552]++;
    self.focus();
    _$jscoverage['/combobox/control.js'].lineData[554]++;
    clearDismissTimer(combobox);
  }
  _$jscoverage['/combobox/control.js'].lineData[557]++;
  function onMenuMouseDown() {
    _$jscoverage['/combobox/control.js'].functionData[24]++;
    _$jscoverage['/combobox/control.js'].lineData[558]++;
    var combobox = this;
    _$jscoverage['/combobox/control.js'].lineData[562]++;
    combobox.setValueFromAutocomplete(combobox.getValueForAutocomplete(), {
  force: 1});
  }
  _$jscoverage['/combobox/control.js'].lineData[567]++;
  function onMenuAfterRenderUI(self, menu) {
    _$jscoverage['/combobox/control.js'].functionData[25]++;
    _$jscoverage['/combobox/control.js'].lineData[568]++;
    var contentEl;
    _$jscoverage['/combobox/control.js'].lineData[569]++;
    var input = self.get('input');
    _$jscoverage['/combobox/control.js'].lineData[570]++;
    var el = menu.get('el');
    _$jscoverage['/combobox/control.js'].lineData[571]++;
    contentEl = menu.get("contentEl");
    _$jscoverage['/combobox/control.js'].lineData[572]++;
    input.attr("aria-owns", el.attr('id'));
    _$jscoverage['/combobox/control.js'].lineData[574]++;
    el.on("focusout", onMenuFocusout, self);
    _$jscoverage['/combobox/control.js'].lineData[575]++;
    el.on("focusin", onMenuFocusin, self);
    _$jscoverage['/combobox/control.js'].lineData[576]++;
    contentEl.on("mouseover", onMenuMouseOver, self);
    _$jscoverage['/combobox/control.js'].lineData[579]++;
    contentEl.on('mousedown', onMenuMouseDown, self);
  }
  _$jscoverage['/combobox/control.js'].lineData[582]++;
  function onMenuItemClick(e) {
    _$jscoverage['/combobox/control.js'].functionData[26]++;
    _$jscoverage['/combobox/control.js'].lineData[583]++;
    var item = e.target, self = this, textContent;
    _$jscoverage['/combobox/control.js'].lineData[586]++;
    if (visit47_586_1(item.isMenuItem)) {
      _$jscoverage['/combobox/control.js'].lineData[587]++;
      textContent = item.get('textContent');
      _$jscoverage['/combobox/control.js'].lineData[588]++;
      self.setValueFromAutocomplete(textContent);
      _$jscoverage['/combobox/control.js'].lineData[589]++;
      self._savedValue = textContent;
      _$jscoverage['/combobox/control.js'].lineData[590]++;
      self.set("collapsed", true);
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[594]++;
  function setInvalid(self, error) {
    _$jscoverage['/combobox/control.js'].functionData[27]++;
    _$jscoverage['/combobox/control.js'].lineData[595]++;
    var $el = self.$el, cls = self.view.getBaseCssClasses('invalid'), invalidEl = self.get("invalidEl");
    _$jscoverage['/combobox/control.js'].lineData[598]++;
    if (visit48_598_1(error)) {
      _$jscoverage['/combobox/control.js'].lineData[599]++;
      $el.addClass(cls);
      _$jscoverage['/combobox/control.js'].lineData[600]++;
      invalidEl.attr("title", error);
      _$jscoverage['/combobox/control.js'].lineData[601]++;
      invalidEl.show();
    } else {
      _$jscoverage['/combobox/control.js'].lineData[603]++;
      $el.removeClass(cls);
      _$jscoverage['/combobox/control.js'].lineData[604]++;
      invalidEl.hide();
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[608]++;
  function delayHide(self) {
    _$jscoverage['/combobox/control.js'].functionData[28]++;
    _$jscoverage['/combobox/control.js'].lineData[609]++;
    if (visit49_609_1(self._focusoutDismissTimer)) {
      _$jscoverage['/combobox/control.js'].lineData[610]++;
      return;
    }
    _$jscoverage['/combobox/control.js'].lineData[612]++;
    self._focusoutDismissTimer = setTimeout(function() {
  _$jscoverage['/combobox/control.js'].functionData[29]++;
  _$jscoverage['/combobox/control.js'].lineData[615]++;
  if (visit50_615_1(self._focusoutDismissTimer)) {
    _$jscoverage['/combobox/control.js'].lineData[616]++;
    self.set("collapsed", true);
  }
}, 50);
  }
  _$jscoverage['/combobox/control.js'].lineData[624]++;
  function clearDismissTimer(self) {
    _$jscoverage['/combobox/control.js'].functionData[30]++;
    _$jscoverage['/combobox/control.js'].lineData[625]++;
    var t;
    _$jscoverage['/combobox/control.js'].lineData[626]++;
    if (visit51_626_1(t = self._focusoutDismissTimer)) {
      _$jscoverage['/combobox/control.js'].lineData[628]++;
      clearTimeout(t);
      _$jscoverage['/combobox/control.js'].lineData[629]++;
      self._focusoutDismissTimer = null;
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[633]++;
  function onValueChange(e) {
    _$jscoverage['/combobox/control.js'].functionData[31]++;
    _$jscoverage['/combobox/control.js'].lineData[634]++;
    this.set('value', e.newVal, {
  data: {
  causedByTimer: 1}});
  }
  _$jscoverage['/combobox/control.js'].lineData[641]++;
  function renderData(data) {
    _$jscoverage['/combobox/control.js'].functionData[32]++;
    _$jscoverage['/combobox/control.js'].lineData[642]++;
    var self = this, v, children = [], val, matchVal, highlightedItem, i, menu = self.get("menu");
    _$jscoverage['/combobox/control.js'].lineData[651]++;
    data = self['normalizeData'](data);
    _$jscoverage['/combobox/control.js'].lineData[653]++;
    var start = S.now();
    _$jscoverage['/combobox/control.js'].lineData[654]++;
    S.log('menu: renderData start');
    _$jscoverage['/combobox/control.js'].lineData[656]++;
    menu.removeChildren(true);
    _$jscoverage['/combobox/control.js'].lineData[658]++;
    if (visit52_658_1(highlightedItem = menu.get('highlightedItem'))) {
      _$jscoverage['/combobox/control.js'].lineData[659]++;
      highlightedItem.set('highlighted', false);
    }
    _$jscoverage['/combobox/control.js'].lineData[662]++;
    if (visit53_662_1(data && data.length)) {
      _$jscoverage['/combobox/control.js'].lineData[663]++;
      for (i = 0; visit54_663_1(i < data.length); i++) {
        _$jscoverage['/combobox/control.js'].lineData[664]++;
        v = data[i];
        _$jscoverage['/combobox/control.js'].lineData[665]++;
        menu.addChild(v);
      }
      _$jscoverage['/combobox/control.js'].lineData[668]++;
      children = menu.get('children');
      _$jscoverage['/combobox/control.js'].lineData[671]++;
      val = self['getValueForAutocomplete']();
      _$jscoverage['/combobox/control.js'].lineData[673]++;
      if (visit55_673_1(self.get('highlightMatchItem'))) {
        _$jscoverage['/combobox/control.js'].lineData[674]++;
        for (i = 0; visit56_674_1(i < children.length); i++) {
          _$jscoverage['/combobox/control.js'].lineData[675]++;
          if (visit57_675_1(children[i].get("textContent") == val)) {
            _$jscoverage['/combobox/control.js'].lineData[676]++;
            children[i].set('highlighted', true);
            _$jscoverage['/combobox/control.js'].lineData[677]++;
            matchVal = true;
            _$jscoverage['/combobox/control.js'].lineData[678]++;
            break;
          }
        }
      }
      _$jscoverage['/combobox/control.js'].lineData[684]++;
      if (visit58_684_1(!matchVal && self.get("autoHighlightFirst"))) {
        _$jscoverage['/combobox/control.js'].lineData[685]++;
        for (i = 0; visit59_685_1(i < children.length); i++) {
          _$jscoverage['/combobox/control.js'].lineData[686]++;
          if (visit60_686_1(!children[i].get("disabled"))) {
            _$jscoverage['/combobox/control.js'].lineData[687]++;
            children[i].set('highlighted', true);
            _$jscoverage['/combobox/control.js'].lineData[688]++;
            break;
          }
        }
      }
      _$jscoverage['/combobox/control.js'].lineData[693]++;
      self.set("collapsed", false);
      _$jscoverage['/combobox/control.js'].lineData[694]++;
      S.log('menu: renderData end: ' + (S.now() - start));
    } else {
      _$jscoverage['/combobox/control.js'].lineData[696]++;
      self.set("collapsed", true);
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[702]++;
  return ComboBox;
}, {
  requires: ['node', 'component/control', './render', 'menu']});
