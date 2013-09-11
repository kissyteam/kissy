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
  _$jscoverage['/combobox/control.js'].lineData[108] = 0;
  _$jscoverage['/combobox/control.js'].lineData[110] = 0;
  _$jscoverage['/combobox/control.js'].lineData[115] = 0;
  _$jscoverage['/combobox/control.js'].lineData[117] = 0;
  _$jscoverage['/combobox/control.js'].lineData[118] = 0;
  _$jscoverage['/combobox/control.js'].lineData[120] = 0;
  _$jscoverage['/combobox/control.js'].lineData[121] = 0;
  _$jscoverage['/combobox/control.js'].lineData[126] = 0;
  _$jscoverage['/combobox/control.js'].lineData[128] = 0;
  _$jscoverage['/combobox/control.js'].lineData[129] = 0;
  _$jscoverage['/combobox/control.js'].lineData[130] = 0;
  _$jscoverage['/combobox/control.js'].lineData[131] = 0;
  _$jscoverage['/combobox/control.js'].lineData[132] = 0;
  _$jscoverage['/combobox/control.js'].lineData[133] = 0;
  _$jscoverage['/combobox/control.js'].lineData[134] = 0;
  _$jscoverage['/combobox/control.js'].lineData[137] = 0;
  _$jscoverage['/combobox/control.js'].lineData[141] = 0;
  _$jscoverage['/combobox/control.js'].lineData[142] = 0;
  _$jscoverage['/combobox/control.js'].lineData[147] = 0;
  _$jscoverage['/combobox/control.js'].lineData[150] = 0;
  _$jscoverage['/combobox/control.js'].lineData[151] = 0;
  _$jscoverage['/combobox/control.js'].lineData[152] = 0;
  _$jscoverage['/combobox/control.js'].lineData[153] = 0;
  _$jscoverage['/combobox/control.js'].lineData[154] = 0;
  _$jscoverage['/combobox/control.js'].lineData[156] = 0;
  _$jscoverage['/combobox/control.js'].lineData[157] = 0;
  _$jscoverage['/combobox/control.js'].lineData[160] = 0;
  _$jscoverage['/combobox/control.js'].lineData[162] = 0;
  _$jscoverage['/combobox/control.js'].lineData[167] = 0;
  _$jscoverage['/combobox/control.js'].lineData[175] = 0;
  _$jscoverage['/combobox/control.js'].lineData[176] = 0;
  _$jscoverage['/combobox/control.js'].lineData[178] = 0;
  _$jscoverage['/combobox/control.js'].lineData[180] = 0;
  _$jscoverage['/combobox/control.js'].lineData[184] = 0;
  _$jscoverage['/combobox/control.js'].lineData[185] = 0;
  _$jscoverage['/combobox/control.js'].lineData[186] = 0;
  _$jscoverage['/combobox/control.js'].lineData[192] = 0;
  _$jscoverage['/combobox/control.js'].lineData[193] = 0;
  _$jscoverage['/combobox/control.js'].lineData[194] = 0;
  _$jscoverage['/combobox/control.js'].lineData[198] = 0;
  _$jscoverage['/combobox/control.js'].lineData[200] = 0;
  _$jscoverage['/combobox/control.js'].lineData[203] = 0;
  _$jscoverage['/combobox/control.js'].lineData[204] = 0;
  _$jscoverage['/combobox/control.js'].lineData[205] = 0;
  _$jscoverage['/combobox/control.js'].lineData[209] = 0;
  _$jscoverage['/combobox/control.js'].lineData[211] = 0;
  _$jscoverage['/combobox/control.js'].lineData[214] = 0;
  _$jscoverage['/combobox/control.js'].lineData[217] = 0;
  _$jscoverage['/combobox/control.js'].lineData[222] = 0;
  _$jscoverage['/combobox/control.js'].lineData[224] = 0;
  _$jscoverage['/combobox/control.js'].lineData[226] = 0;
  _$jscoverage['/combobox/control.js'].lineData[227] = 0;
  _$jscoverage['/combobox/control.js'].lineData[231] = 0;
  _$jscoverage['/combobox/control.js'].lineData[232] = 0;
  _$jscoverage['/combobox/control.js'].lineData[234] = 0;
  _$jscoverage['/combobox/control.js'].lineData[235] = 0;
  _$jscoverage['/combobox/control.js'].lineData[236] = 0;
  _$jscoverage['/combobox/control.js'].lineData[237] = 0;
  _$jscoverage['/combobox/control.js'].lineData[240] = 0;
  _$jscoverage['/combobox/control.js'].lineData[244] = 0;
  _$jscoverage['/combobox/control.js'].lineData[248] = 0;
  _$jscoverage['/combobox/control.js'].lineData[249] = 0;
  _$jscoverage['/combobox/control.js'].lineData[250] = 0;
  _$jscoverage['/combobox/control.js'].lineData[253] = 0;
  _$jscoverage['/combobox/control.js'].lineData[262] = 0;
  _$jscoverage['/combobox/control.js'].lineData[264] = 0;
  _$jscoverage['/combobox/control.js'].lineData[268] = 0;
  _$jscoverage['/combobox/control.js'].lineData[271] = 0;
  _$jscoverage['/combobox/control.js'].lineData[272] = 0;
  _$jscoverage['/combobox/control.js'].lineData[275] = 0;
  _$jscoverage['/combobox/control.js'].lineData[276] = 0;
  _$jscoverage['/combobox/control.js'].lineData[277] = 0;
  _$jscoverage['/combobox/control.js'].lineData[278] = 0;
  _$jscoverage['/combobox/control.js'].lineData[279] = 0;
  _$jscoverage['/combobox/control.js'].lineData[280] = 0;
  _$jscoverage['/combobox/control.js'].lineData[283] = 0;
  _$jscoverage['/combobox/control.js'].lineData[285] = 0;
  _$jscoverage['/combobox/control.js'].lineData[394] = 0;
  _$jscoverage['/combobox/control.js'].lineData[395] = 0;
  _$jscoverage['/combobox/control.js'].lineData[396] = 0;
  _$jscoverage['/combobox/control.js'].lineData[397] = 0;
  _$jscoverage['/combobox/control.js'].lineData[399] = 0;
  _$jscoverage['/combobox/control.js'].lineData[402] = 0;
  _$jscoverage['/combobox/control.js'].lineData[403] = 0;
  _$jscoverage['/combobox/control.js'].lineData[404] = 0;
  _$jscoverage['/combobox/control.js'].lineData[412] = 0;
  _$jscoverage['/combobox/control.js'].lineData[520] = 0;
  _$jscoverage['/combobox/control.js'].lineData[521] = 0;
  _$jscoverage['/combobox/control.js'].lineData[522] = 0;
  _$jscoverage['/combobox/control.js'].lineData[523] = 0;
  _$jscoverage['/combobox/control.js'].lineData[526] = 0;
  _$jscoverage['/combobox/control.js'].lineData[529] = 0;
  _$jscoverage['/combobox/control.js'].lineData[530] = 0;
  _$jscoverage['/combobox/control.js'].lineData[531] = 0;
  _$jscoverage['/combobox/control.js'].lineData[534] = 0;
  _$jscoverage['/combobox/control.js'].lineData[535] = 0;
  _$jscoverage['/combobox/control.js'].lineData[539] = 0;
  _$jscoverage['/combobox/control.js'].lineData[540] = 0;
  _$jscoverage['/combobox/control.js'].lineData[544] = 0;
  _$jscoverage['/combobox/control.js'].lineData[545] = 0;
  _$jscoverage['/combobox/control.js'].lineData[547] = 0;
  _$jscoverage['/combobox/control.js'].lineData[549] = 0;
  _$jscoverage['/combobox/control.js'].lineData[552] = 0;
  _$jscoverage['/combobox/control.js'].lineData[553] = 0;
  _$jscoverage['/combobox/control.js'].lineData[557] = 0;
  _$jscoverage['/combobox/control.js'].lineData[562] = 0;
  _$jscoverage['/combobox/control.js'].lineData[563] = 0;
  _$jscoverage['/combobox/control.js'].lineData[564] = 0;
  _$jscoverage['/combobox/control.js'].lineData[565] = 0;
  _$jscoverage['/combobox/control.js'].lineData[566] = 0;
  _$jscoverage['/combobox/control.js'].lineData[567] = 0;
  _$jscoverage['/combobox/control.js'].lineData[569] = 0;
  _$jscoverage['/combobox/control.js'].lineData[570] = 0;
  _$jscoverage['/combobox/control.js'].lineData[571] = 0;
  _$jscoverage['/combobox/control.js'].lineData[574] = 0;
  _$jscoverage['/combobox/control.js'].lineData[577] = 0;
  _$jscoverage['/combobox/control.js'].lineData[578] = 0;
  _$jscoverage['/combobox/control.js'].lineData[581] = 0;
  _$jscoverage['/combobox/control.js'].lineData[582] = 0;
  _$jscoverage['/combobox/control.js'].lineData[583] = 0;
  _$jscoverage['/combobox/control.js'].lineData[584] = 0;
  _$jscoverage['/combobox/control.js'].lineData[585] = 0;
  _$jscoverage['/combobox/control.js'].lineData[589] = 0;
  _$jscoverage['/combobox/control.js'].lineData[590] = 0;
  _$jscoverage['/combobox/control.js'].lineData[593] = 0;
  _$jscoverage['/combobox/control.js'].lineData[594] = 0;
  _$jscoverage['/combobox/control.js'].lineData[595] = 0;
  _$jscoverage['/combobox/control.js'].lineData[596] = 0;
  _$jscoverage['/combobox/control.js'].lineData[598] = 0;
  _$jscoverage['/combobox/control.js'].lineData[599] = 0;
  _$jscoverage['/combobox/control.js'].lineData[603] = 0;
  _$jscoverage['/combobox/control.js'].lineData[604] = 0;
  _$jscoverage['/combobox/control.js'].lineData[605] = 0;
  _$jscoverage['/combobox/control.js'].lineData[607] = 0;
  _$jscoverage['/combobox/control.js'].lineData[609] = 0;
  _$jscoverage['/combobox/control.js'].lineData[610] = 0;
  _$jscoverage['/combobox/control.js'].lineData[617] = 0;
  _$jscoverage['/combobox/control.js'].lineData[618] = 0;
  _$jscoverage['/combobox/control.js'].lineData[619] = 0;
  _$jscoverage['/combobox/control.js'].lineData[620] = 0;
  _$jscoverage['/combobox/control.js'].lineData[621] = 0;
  _$jscoverage['/combobox/control.js'].lineData[625] = 0;
  _$jscoverage['/combobox/control.js'].lineData[626] = 0;
  _$jscoverage['/combobox/control.js'].lineData[633] = 0;
  _$jscoverage['/combobox/control.js'].lineData[634] = 0;
  _$jscoverage['/combobox/control.js'].lineData[643] = 0;
  _$jscoverage['/combobox/control.js'].lineData[645] = 0;
  _$jscoverage['/combobox/control.js'].lineData[647] = 0;
  _$jscoverage['/combobox/control.js'].lineData[649] = 0;
  _$jscoverage['/combobox/control.js'].lineData[650] = 0;
  _$jscoverage['/combobox/control.js'].lineData[653] = 0;
  _$jscoverage['/combobox/control.js'].lineData[654] = 0;
  _$jscoverage['/combobox/control.js'].lineData[655] = 0;
  _$jscoverage['/combobox/control.js'].lineData[656] = 0;
  _$jscoverage['/combobox/control.js'].lineData[659] = 0;
  _$jscoverage['/combobox/control.js'].lineData[662] = 0;
  _$jscoverage['/combobox/control.js'].lineData[664] = 0;
  _$jscoverage['/combobox/control.js'].lineData[665] = 0;
  _$jscoverage['/combobox/control.js'].lineData[666] = 0;
  _$jscoverage['/combobox/control.js'].lineData[667] = 0;
  _$jscoverage['/combobox/control.js'].lineData[668] = 0;
  _$jscoverage['/combobox/control.js'].lineData[669] = 0;
  _$jscoverage['/combobox/control.js'].lineData[675] = 0;
  _$jscoverage['/combobox/control.js'].lineData[676] = 0;
  _$jscoverage['/combobox/control.js'].lineData[677] = 0;
  _$jscoverage['/combobox/control.js'].lineData[678] = 0;
  _$jscoverage['/combobox/control.js'].lineData[679] = 0;
  _$jscoverage['/combobox/control.js'].lineData[684] = 0;
  _$jscoverage['/combobox/control.js'].lineData[686] = 0;
  _$jscoverage['/combobox/control.js'].lineData[692] = 0;
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
  _$jscoverage['/combobox/control.js'].branchData['117'] = [];
  _$jscoverage['/combobox/control.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['120'] = [];
  _$jscoverage['/combobox/control.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['130'] = [];
  _$jscoverage['/combobox/control.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['132'] = [];
  _$jscoverage['/combobox/control.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['133'] = [];
  _$jscoverage['/combobox/control.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['133'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['141'] = [];
  _$jscoverage['/combobox/control.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['153'] = [];
  _$jscoverage['/combobox/control.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['153'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['153'][3] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['154'] = [];
  _$jscoverage['/combobox/control.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['178'] = [];
  _$jscoverage['/combobox/control.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['184'] = [];
  _$jscoverage['/combobox/control.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['186'] = [];
  _$jscoverage['/combobox/control.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['186'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['186'][3] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['187'] = [];
  _$jscoverage['/combobox/control.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['189'] = [];
  _$jscoverage['/combobox/control.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['189'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['190'] = [];
  _$jscoverage['/combobox/control.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['203'] = [];
  _$jscoverage['/combobox/control.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['205'] = [];
  _$jscoverage['/combobox/control.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['214'] = [];
  _$jscoverage['/combobox/control.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['222'] = [];
  _$jscoverage['/combobox/control.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['222'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['226'] = [];
  _$jscoverage['/combobox/control.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['232'] = [];
  _$jscoverage['/combobox/control.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['232'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['232'][3] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['235'] = [];
  _$jscoverage['/combobox/control.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['248'] = [];
  _$jscoverage['/combobox/control.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['271'] = [];
  _$jscoverage['/combobox/control.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['276'] = [];
  _$jscoverage['/combobox/control.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['277'] = [];
  _$jscoverage['/combobox/control.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['281'] = [];
  _$jscoverage['/combobox/control.js'].branchData['281'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['282'] = [];
  _$jscoverage['/combobox/control.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['394'] = [];
  _$jscoverage['/combobox/control.js'].branchData['394'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['395'] = [];
  _$jscoverage['/combobox/control.js'].branchData['395'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['402'] = [];
  _$jscoverage['/combobox/control.js'].branchData['402'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['521'] = [];
  _$jscoverage['/combobox/control.js'].branchData['521'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['522'] = [];
  _$jscoverage['/combobox/control.js'].branchData['522'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['581'] = [];
  _$jscoverage['/combobox/control.js'].branchData['581'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['593'] = [];
  _$jscoverage['/combobox/control.js'].branchData['593'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['604'] = [];
  _$jscoverage['/combobox/control.js'].branchData['604'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['609'] = [];
  _$jscoverage['/combobox/control.js'].branchData['609'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['619'] = [];
  _$jscoverage['/combobox/control.js'].branchData['619'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['649'] = [];
  _$jscoverage['/combobox/control.js'].branchData['649'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['653'] = [];
  _$jscoverage['/combobox/control.js'].branchData['653'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['654'] = [];
  _$jscoverage['/combobox/control.js'].branchData['654'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['664'] = [];
  _$jscoverage['/combobox/control.js'].branchData['664'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['665'] = [];
  _$jscoverage['/combobox/control.js'].branchData['665'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['666'] = [];
  _$jscoverage['/combobox/control.js'].branchData['666'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['675'] = [];
  _$jscoverage['/combobox/control.js'].branchData['675'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['676'] = [];
  _$jscoverage['/combobox/control.js'].branchData['676'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['677'] = [];
  _$jscoverage['/combobox/control.js'].branchData['677'][1] = new BranchData();
}
_$jscoverage['/combobox/control.js'].branchData['677'][1].init(26, 28, '!children[i].get("disabled")');
function visit60_677_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['677'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['676'][1].init(30, 19, 'i < children.length');
function visit59_676_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['676'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['675'][1].init(777, 43, '!matchVal && self.get("autoHighlightFirst")');
function visit58_675_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['675'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['666'][1].init(26, 37, 'children[i].get("textContent") == val');
function visit57_666_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['666'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['665'][1].init(30, 19, 'i < children.length');
function visit56_665_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['665'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['664'][1].init(328, 30, 'self.get(\'highlightMatchItem\')');
function visit55_664_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['664'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['654'][1].init(26, 15, 'i < data.length');
function visit54_654_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['654'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['653'][1].init(459, 19, 'data && data.length');
function visit53_653_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['653'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['649'][1].init(328, 45, 'highlightedItem = menu.get(\'highlightedItem\')');
function visit52_649_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['649'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['619'][1].init(30, 30, 't = self._focusoutDismissTimer');
function visit51_619_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['619'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['609'][1].init(50, 26, 'self._focusoutDismissTimer');
function visit50_609_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['609'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['604'][1].init(14, 26, 'self._focusoutDismissTimer');
function visit49_604_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['604'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['593'][1].init(150, 5, 'error');
function visit48_593_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['593'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['581'][1].init(96, 15, 'item.isMenuItem');
function visit47_581_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['581'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['522'][1].init(18, 28, '!children[i].get(\'disabled\')');
function visit46_522_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['522'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['521'][1].init(26, 19, 'i < children.length');
function visit45_521_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['521'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['402'][1].init(30, 11, 'm.isControl');
function visit44_402_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['395'][1].init(41, 23, 'v.xclass || \'popupmenu\'');
function visit43_395_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['395'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['394'][1].init(30, 12, '!v.isControl');
function visit42_394_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['394'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['282'][1].init(85, 45, 'parseInt(menuEl.css(\'borderRightWidth\')) || 0');
function visit41_282_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['281'][1].init(47, 44, 'parseInt(menuEl.css(\'borderLeftWidth\')) || 0');
function visit40_281_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['281'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['277'][1].init(30, 24, 'self.get("matchElWidth")');
function visit39_277_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['276'][1].init(119, 20, '!menu.get("visible")');
function visit38_276_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['271'][1].init(138, 1, 'v');
function visit37_271_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['248'][1].init(173, 9, 'validator');
function visit36_248_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['235'][1].init(145, 15, 'v !== undefined');
function visit35_235_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['232'][3].init(3024, 21, 'keyCode == KeyCode.UP');
function visit34_232_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['232'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['232'][2].init(2997, 23, 'keyCode == KeyCode.DOWN');
function visit33_232_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['232'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['232'][1].init(2997, 48, 'keyCode == KeyCode.DOWN || keyCode == KeyCode.UP');
function visit32_232_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['226'][1].init(215, 20, 'self.get("multiple")');
function visit31_226_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['222'][2].init(2118, 22, 'keyCode == KeyCode.TAB');
function visit30_222_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['222'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['222'][1].init(2118, 41, 'keyCode == KeyCode.TAB && highlightedItem');
function visit29_222_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['214'][1].init(1681, 94, 'updateInputOnDownUp && S.inArray(keyCode, [KeyCode.DOWN, KeyCode.UP])');
function visit28_214_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['205'][1].init(84, 19, 'updateInputOnDownUp');
function visit27_205_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['203'][1].init(1156, 22, 'keyCode == KeyCode.ESC');
function visit26_203_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['190'][1].init(57, 52, 'highlightedItem == getFirstEnabledItem(menuChildren)');
function visit25_190_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['189'][2].init(287, 21, 'keyCode == KeyCode.UP');
function visit24_189_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['189'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['189'][1].init(188, 110, 'keyCode == KeyCode.UP && highlightedItem == getFirstEnabledItem(menuChildren)');
function visit23_189_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['187'][1].init(55, 71, 'highlightedItem == getFirstEnabledItem(menuChildren.concat().reverse())');
function visit22_187_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['186'][3].init(96, 23, 'keyCode == KeyCode.DOWN');
function visit21_186_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['186'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['186'][2].init(96, 127, 'keyCode == KeyCode.DOWN && highlightedItem == getFirstEnabledItem(menuChildren.concat().reverse())');
function visit20_186_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['186'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['186'][1].init(96, 299, 'keyCode == KeyCode.DOWN && highlightedItem == getFirstEnabledItem(menuChildren.concat().reverse()) || keyCode == KeyCode.UP && highlightedItem == getFirstEnabledItem(menuChildren)');
function visit19_186_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['184'][1].init(249, 38, 'updateInputOnDownUp && highlightedItem');
function visit18_184_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['178'][1].init(408, 19, 'menu.get("visible")');
function visit17_178_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['154'][1].init(26, 21, 'self.get(\'collapsed\')');
function visit16_154_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['153'][3].init(247, 20, 'trigger[0] == target');
function visit15_153_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['153'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['153'][2].init(247, 48, 'trigger[0] == target || trigger.contains(target)');
function visit14_153_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['153'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['153'][1].init(235, 61, 'trigger && (trigger[0] == target || trigger.contains(target))');
function visit13_153_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['141'][1].init(666, 35, 'placeholderEl && !self.get(\'value\')');
function visit12_141_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['133'][2].init(58, 24, 'val == self.get(\'value\')');
function visit11_133_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['133'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['133'][1].init(34, 48, '!self.get("focused") && val == self.get(\'value\')');
function visit10_133_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['132'][1].init(30, 5, 'error');
function visit9_132_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['130'][1].init(190, 21, 'self.get(\'invalidEl\')');
function visit8_130_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['120'][1].init(203, 41, 'placeholderEl = self.get("placeholderEl")');
function visit7_120_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['117'][1].init(92, 21, 'self.get(\'invalidEl\')');
function visit6_117_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['117'][1].ranCondition(result);
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
    _$jscoverage['/combobox/control.js'].lineData[108]++;
    self.sendRequest(value);
  } else {
    _$jscoverage['/combobox/control.js'].lineData[110]++;
    self.get('input').val(v);
  }
}, 
  handleFocusInternal: function() {
  _$jscoverage['/combobox/control.js'].functionData[8]++;
  _$jscoverage['/combobox/control.js'].lineData[115]++;
  var self = this, placeholderEl;
  _$jscoverage['/combobox/control.js'].lineData[117]++;
  if (visit6_117_1(self.get('invalidEl'))) {
    _$jscoverage['/combobox/control.js'].lineData[118]++;
    setInvalid(self, false);
  }
  _$jscoverage['/combobox/control.js'].lineData[120]++;
  if (visit7_120_1(placeholderEl = self.get("placeholderEl"))) {
    _$jscoverage['/combobox/control.js'].lineData[121]++;
    placeholderEl.hide();
  }
}, 
  handleBlurInternal: function(e) {
  _$jscoverage['/combobox/control.js'].functionData[9]++;
  _$jscoverage['/combobox/control.js'].lineData[126]++;
  var self = this, placeholderEl = self.get("placeholderEl");
  _$jscoverage['/combobox/control.js'].lineData[128]++;
  self.callSuper(e);
  _$jscoverage['/combobox/control.js'].lineData[129]++;
  delayHide(self);
  _$jscoverage['/combobox/control.js'].lineData[130]++;
  if (visit8_130_1(self.get('invalidEl'))) {
    _$jscoverage['/combobox/control.js'].lineData[131]++;
    self.validate(function(error, val) {
  _$jscoverage['/combobox/control.js'].functionData[10]++;
  _$jscoverage['/combobox/control.js'].lineData[132]++;
  if (visit9_132_1(error)) {
    _$jscoverage['/combobox/control.js'].lineData[133]++;
    if (visit10_133_1(!self.get("focused") && visit11_133_2(val == self.get('value')))) {
      _$jscoverage['/combobox/control.js'].lineData[134]++;
      setInvalid(self, error);
    }
  } else {
    _$jscoverage['/combobox/control.js'].lineData[137]++;
    setInvalid(self, false);
  }
});
  }
  _$jscoverage['/combobox/control.js'].lineData[141]++;
  if (visit12_141_1(placeholderEl && !self.get('value'))) {
    _$jscoverage['/combobox/control.js'].lineData[142]++;
    placeholderEl.show();
  }
}, 
  handleMouseDownInternal: function(e) {
  _$jscoverage['/combobox/control.js'].functionData[11]++;
  _$jscoverage['/combobox/control.js'].lineData[147]++;
  var self = this, target, trigger;
  _$jscoverage['/combobox/control.js'].lineData[150]++;
  self.callSuper(e);
  _$jscoverage['/combobox/control.js'].lineData[151]++;
  target = e.target;
  _$jscoverage['/combobox/control.js'].lineData[152]++;
  trigger = self.get("trigger");
  _$jscoverage['/combobox/control.js'].lineData[153]++;
  if (visit13_153_1(trigger && (visit14_153_2(visit15_153_3(trigger[0] == target) || trigger.contains(target))))) {
    _$jscoverage['/combobox/control.js'].lineData[154]++;
    if (visit16_154_1(self.get('collapsed'))) {
      _$jscoverage['/combobox/control.js'].lineData[156]++;
      self.focus();
      _$jscoverage['/combobox/control.js'].lineData[157]++;
      self.sendRequest('');
    } else {
      _$jscoverage['/combobox/control.js'].lineData[160]++;
      self.set('collapsed', true);
    }
    _$jscoverage['/combobox/control.js'].lineData[162]++;
    e.preventDefault();
  }
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/combobox/control.js'].functionData[12]++;
  _$jscoverage['/combobox/control.js'].lineData[167]++;
  var self = this, updateInputOnDownUp, input, keyCode = e.keyCode, highlightedItem, handledByMenu, menu = self.get("menu");
  _$jscoverage['/combobox/control.js'].lineData[175]++;
  input = self.get("input");
  _$jscoverage['/combobox/control.js'].lineData[176]++;
  updateInputOnDownUp = self.get("updateInputOnDownUp");
  _$jscoverage['/combobox/control.js'].lineData[178]++;
  if (visit17_178_1(menu.get("visible"))) {
    _$jscoverage['/combobox/control.js'].lineData[180]++;
    highlightedItem = menu.get("highlightedItem");
    _$jscoverage['/combobox/control.js'].lineData[184]++;
    if (visit18_184_1(updateInputOnDownUp && highlightedItem)) {
      _$jscoverage['/combobox/control.js'].lineData[185]++;
      var menuChildren = menu.get('children');
      _$jscoverage['/combobox/control.js'].lineData[186]++;
      if (visit19_186_1(visit20_186_2(visit21_186_3(keyCode == KeyCode.DOWN) && visit22_187_1(highlightedItem == getFirstEnabledItem(menuChildren.concat().reverse()))) || visit23_189_1(visit24_189_2(keyCode == KeyCode.UP) && visit25_190_1(highlightedItem == getFirstEnabledItem(menuChildren))))) {
        _$jscoverage['/combobox/control.js'].lineData[192]++;
        self.setValueFromAutocomplete(self._savedValue);
        _$jscoverage['/combobox/control.js'].lineData[193]++;
        highlightedItem.set('highlighted', false);
        _$jscoverage['/combobox/control.js'].lineData[194]++;
        return true;
      }
    }
    _$jscoverage['/combobox/control.js'].lineData[198]++;
    handledByMenu = menu.handleKeyDownInternal(e);
    _$jscoverage['/combobox/control.js'].lineData[200]++;
    highlightedItem = menu.get("highlightedItem");
    _$jscoverage['/combobox/control.js'].lineData[203]++;
    if (visit26_203_1(keyCode == KeyCode.ESC)) {
      _$jscoverage['/combobox/control.js'].lineData[204]++;
      self.set("collapsed", true);
      _$jscoverage['/combobox/control.js'].lineData[205]++;
      if (visit27_205_1(updateInputOnDownUp)) {
        _$jscoverage['/combobox/control.js'].lineData[209]++;
        self.setValueFromAutocomplete(self._savedValue);
      }
      _$jscoverage['/combobox/control.js'].lineData[211]++;
      return true;
    }
    _$jscoverage['/combobox/control.js'].lineData[214]++;
    if (visit28_214_1(updateInputOnDownUp && S.inArray(keyCode, [KeyCode.DOWN, KeyCode.UP]))) {
      _$jscoverage['/combobox/control.js'].lineData[217]++;
      self.setValueFromAutocomplete(highlightedItem.get("textContent"));
    }
    _$jscoverage['/combobox/control.js'].lineData[222]++;
    if (visit29_222_1(visit30_222_2(keyCode == KeyCode.TAB) && highlightedItem)) {
      _$jscoverage['/combobox/control.js'].lineData[224]++;
      highlightedItem.handleClickInternal();
      _$jscoverage['/combobox/control.js'].lineData[226]++;
      if (visit31_226_1(self.get("multiple"))) {
        _$jscoverage['/combobox/control.js'].lineData[227]++;
        return true;
      }
    }
    _$jscoverage['/combobox/control.js'].lineData[231]++;
    return handledByMenu;
  } else {
    _$jscoverage['/combobox/control.js'].lineData[232]++;
    if (visit32_232_1(visit33_232_2(keyCode == KeyCode.DOWN) || visit34_232_3(keyCode == KeyCode.UP))) {
      _$jscoverage['/combobox/control.js'].lineData[234]++;
      var v = self.getValueForAutocomplete();
      _$jscoverage['/combobox/control.js'].lineData[235]++;
      if (visit35_235_1(v !== undefined)) {
        _$jscoverage['/combobox/control.js'].lineData[236]++;
        self.sendRequest(v);
        _$jscoverage['/combobox/control.js'].lineData[237]++;
        return true;
      }
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[240]++;
  return undefined;
}, 
  validate: function(callback) {
  _$jscoverage['/combobox/control.js'].functionData[13]++;
  _$jscoverage['/combobox/control.js'].lineData[244]++;
  var self = this, validator = self.get('validator'), val = self.getValueForAutocomplete();
  _$jscoverage['/combobox/control.js'].lineData[248]++;
  if (visit36_248_1(validator)) {
    _$jscoverage['/combobox/control.js'].lineData[249]++;
    validator(val, function(error) {
  _$jscoverage['/combobox/control.js'].functionData[14]++;
  _$jscoverage['/combobox/control.js'].lineData[250]++;
  callback(error, val);
});
  } else {
    _$jscoverage['/combobox/control.js'].lineData[253]++;
    callback(false, val);
  }
}, 
  sendRequest: function(value) {
  _$jscoverage['/combobox/control.js'].functionData[15]++;
  _$jscoverage['/combobox/control.js'].lineData[262]++;
  var self = this, dataSource = self.get("dataSource");
  _$jscoverage['/combobox/control.js'].lineData[264]++;
  dataSource.fetchData(value, renderData, self);
}, 
  _onSetCollapsed: function(v) {
  _$jscoverage['/combobox/control.js'].functionData[16]++;
  _$jscoverage['/combobox/control.js'].lineData[268]++;
  var self = this, el = self.$el, menu = self.get('menu');
  _$jscoverage['/combobox/control.js'].lineData[271]++;
  if (visit37_271_1(v)) {
    _$jscoverage['/combobox/control.js'].lineData[272]++;
    menu.hide();
  } else {
    _$jscoverage['/combobox/control.js'].lineData[275]++;
    clearDismissTimer(self);
    _$jscoverage['/combobox/control.js'].lineData[276]++;
    if (visit38_276_1(!menu.get("visible"))) {
      _$jscoverage['/combobox/control.js'].lineData[277]++;
      if (visit39_277_1(self.get("matchElWidth"))) {
        _$jscoverage['/combobox/control.js'].lineData[278]++;
        menu.render();
        _$jscoverage['/combobox/control.js'].lineData[279]++;
        var menuEl = menu.get('el');
        _$jscoverage['/combobox/control.js'].lineData[280]++;
        var borderWidth = (visit40_281_1(parseInt(menuEl.css('borderLeftWidth')) || 0)) + (visit41_282_1(parseInt(menuEl.css('borderRightWidth')) || 0));
        _$jscoverage['/combobox/control.js'].lineData[283]++;
        menu.set("width", el[0].offsetWidth - borderWidth);
      }
      _$jscoverage['/combobox/control.js'].lineData[285]++;
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
  _$jscoverage['/combobox/control.js'].lineData[394]++;
  if (visit42_394_1(!v.isControl)) {
    _$jscoverage['/combobox/control.js'].lineData[395]++;
    v.xclass = visit43_395_1(v.xclass || 'popupmenu');
    _$jscoverage['/combobox/control.js'].lineData[396]++;
    v = this.createComponent(v);
    _$jscoverage['/combobox/control.js'].lineData[397]++;
    this.setInternal('menu', v);
  }
  _$jscoverage['/combobox/control.js'].lineData[399]++;
  return v;
}, 
  setter: function(m) {
  _$jscoverage['/combobox/control.js'].functionData[18]++;
  _$jscoverage['/combobox/control.js'].lineData[402]++;
  if (visit44_402_1(m.isControl)) {
    _$jscoverage['/combobox/control.js'].lineData[403]++;
    m.setInternal('parent', this);
    _$jscoverage['/combobox/control.js'].lineData[404]++;
    var align = {
  node: this.$el, 
  points: ["bl", "tl"], 
  overflow: {
  adjustX: 1, 
  adjustY: 1}};
    _$jscoverage['/combobox/control.js'].lineData[412]++;
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
  _$jscoverage['/combobox/control.js'].lineData[520]++;
  function getFirstEnabledItem(children) {
    _$jscoverage['/combobox/control.js'].functionData[19]++;
    _$jscoverage['/combobox/control.js'].lineData[521]++;
    for (var i = 0; visit45_521_1(i < children.length); i++) {
      _$jscoverage['/combobox/control.js'].lineData[522]++;
      if (visit46_522_1(!children[i].get('disabled'))) {
        _$jscoverage['/combobox/control.js'].lineData[523]++;
        return children[i];
      }
    }
    _$jscoverage['/combobox/control.js'].lineData[526]++;
    return null;
  }
  _$jscoverage['/combobox/control.js'].lineData[529]++;
  function onMenuFocusout() {
    _$jscoverage['/combobox/control.js'].functionData[20]++;
    _$jscoverage['/combobox/control.js'].lineData[530]++;
    var combobox = this;
    _$jscoverage['/combobox/control.js'].lineData[531]++;
    delayHide(combobox);
  }
  _$jscoverage['/combobox/control.js'].lineData[534]++;
  function onMenuFocusin() {
    _$jscoverage['/combobox/control.js'].functionData[21]++;
    _$jscoverage['/combobox/control.js'].lineData[535]++;
    var combobox = this;
    _$jscoverage['/combobox/control.js'].lineData[539]++;
    setTimeout(function() {
  _$jscoverage['/combobox/control.js'].functionData[22]++;
  _$jscoverage['/combobox/control.js'].lineData[540]++;
  clearDismissTimer(combobox);
}, 0);
  }
  _$jscoverage['/combobox/control.js'].lineData[544]++;
  function onMenuMouseOver() {
    _$jscoverage['/combobox/control.js'].functionData[23]++;
    _$jscoverage['/combobox/control.js'].lineData[545]++;
    var combobox = this;
    _$jscoverage['/combobox/control.js'].lineData[547]++;
    self.focus();
    _$jscoverage['/combobox/control.js'].lineData[549]++;
    clearDismissTimer(combobox);
  }
  _$jscoverage['/combobox/control.js'].lineData[552]++;
  function onMenuMouseDown() {
    _$jscoverage['/combobox/control.js'].functionData[24]++;
    _$jscoverage['/combobox/control.js'].lineData[553]++;
    var combobox = this;
    _$jscoverage['/combobox/control.js'].lineData[557]++;
    combobox.setValueFromAutocomplete(combobox.getValueForAutocomplete(), {
  force: 1});
  }
  _$jscoverage['/combobox/control.js'].lineData[562]++;
  function onMenuAfterRenderUI(self, menu) {
    _$jscoverage['/combobox/control.js'].functionData[25]++;
    _$jscoverage['/combobox/control.js'].lineData[563]++;
    var contentEl;
    _$jscoverage['/combobox/control.js'].lineData[564]++;
    var input = self.get('input');
    _$jscoverage['/combobox/control.js'].lineData[565]++;
    var el = menu.get('el');
    _$jscoverage['/combobox/control.js'].lineData[566]++;
    contentEl = menu.get("contentEl");
    _$jscoverage['/combobox/control.js'].lineData[567]++;
    input.attr("aria-owns", el.attr('id'));
    _$jscoverage['/combobox/control.js'].lineData[569]++;
    el.on("focusout", onMenuFocusout, self);
    _$jscoverage['/combobox/control.js'].lineData[570]++;
    el.on("focusin", onMenuFocusin, self);
    _$jscoverage['/combobox/control.js'].lineData[571]++;
    contentEl.on("mouseover", onMenuMouseOver, self);
    _$jscoverage['/combobox/control.js'].lineData[574]++;
    contentEl.on('mousedown', onMenuMouseDown, self);
  }
  _$jscoverage['/combobox/control.js'].lineData[577]++;
  function onMenuItemClick(e) {
    _$jscoverage['/combobox/control.js'].functionData[26]++;
    _$jscoverage['/combobox/control.js'].lineData[578]++;
    var item = e.target, self = this, textContent;
    _$jscoverage['/combobox/control.js'].lineData[581]++;
    if (visit47_581_1(item.isMenuItem)) {
      _$jscoverage['/combobox/control.js'].lineData[582]++;
      textContent = item.get('textContent');
      _$jscoverage['/combobox/control.js'].lineData[583]++;
      self.setValueFromAutocomplete(textContent);
      _$jscoverage['/combobox/control.js'].lineData[584]++;
      self._savedValue = textContent;
      _$jscoverage['/combobox/control.js'].lineData[585]++;
      self.set("collapsed", true);
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[589]++;
  function setInvalid(self, error) {
    _$jscoverage['/combobox/control.js'].functionData[27]++;
    _$jscoverage['/combobox/control.js'].lineData[590]++;
    var $el = self.$el, cls = self.view.getBaseCssClasses('invalid'), invalidEl = self.get("invalidEl");
    _$jscoverage['/combobox/control.js'].lineData[593]++;
    if (visit48_593_1(error)) {
      _$jscoverage['/combobox/control.js'].lineData[594]++;
      $el.addClass(cls);
      _$jscoverage['/combobox/control.js'].lineData[595]++;
      invalidEl.attr("title", error);
      _$jscoverage['/combobox/control.js'].lineData[596]++;
      invalidEl.show();
    } else {
      _$jscoverage['/combobox/control.js'].lineData[598]++;
      $el.removeClass(cls);
      _$jscoverage['/combobox/control.js'].lineData[599]++;
      invalidEl.hide();
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[603]++;
  function delayHide(self) {
    _$jscoverage['/combobox/control.js'].functionData[28]++;
    _$jscoverage['/combobox/control.js'].lineData[604]++;
    if (visit49_604_1(self._focusoutDismissTimer)) {
      _$jscoverage['/combobox/control.js'].lineData[605]++;
      return;
    }
    _$jscoverage['/combobox/control.js'].lineData[607]++;
    self._focusoutDismissTimer = setTimeout(function() {
  _$jscoverage['/combobox/control.js'].functionData[29]++;
  _$jscoverage['/combobox/control.js'].lineData[609]++;
  if (visit50_609_1(self._focusoutDismissTimer)) {
    _$jscoverage['/combobox/control.js'].lineData[610]++;
    self.set("collapsed", true);
  }
}, 50);
  }
  _$jscoverage['/combobox/control.js'].lineData[617]++;
  function clearDismissTimer(self) {
    _$jscoverage['/combobox/control.js'].functionData[30]++;
    _$jscoverage['/combobox/control.js'].lineData[618]++;
    var t;
    _$jscoverage['/combobox/control.js'].lineData[619]++;
    if (visit51_619_1(t = self._focusoutDismissTimer)) {
      _$jscoverage['/combobox/control.js'].lineData[620]++;
      clearTimeout(t);
      _$jscoverage['/combobox/control.js'].lineData[621]++;
      self._focusoutDismissTimer = null;
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[625]++;
  function onValueChange(e) {
    _$jscoverage['/combobox/control.js'].functionData[31]++;
    _$jscoverage['/combobox/control.js'].lineData[626]++;
    this.set('value', e.newVal, {
  data: {
  causedByTimer: 1}});
  }
  _$jscoverage['/combobox/control.js'].lineData[633]++;
  function renderData(data) {
    _$jscoverage['/combobox/control.js'].functionData[32]++;
    _$jscoverage['/combobox/control.js'].lineData[634]++;
    var self = this, v, children = [], val, matchVal, highlightedItem, i, menu = self.get("menu");
    _$jscoverage['/combobox/control.js'].lineData[643]++;
    data = self['normalizeData'](data);
    _$jscoverage['/combobox/control.js'].lineData[645]++;
    var start = S.now();
    _$jscoverage['/combobox/control.js'].lineData[647]++;
    menu.removeChildren(true);
    _$jscoverage['/combobox/control.js'].lineData[649]++;
    if (visit52_649_1(highlightedItem = menu.get('highlightedItem'))) {
      _$jscoverage['/combobox/control.js'].lineData[650]++;
      highlightedItem.set('highlighted', false);
    }
    _$jscoverage['/combobox/control.js'].lineData[653]++;
    if (visit53_653_1(data && data.length)) {
      _$jscoverage['/combobox/control.js'].lineData[654]++;
      for (i = 0; visit54_654_1(i < data.length); i++) {
        _$jscoverage['/combobox/control.js'].lineData[655]++;
        v = data[i];
        _$jscoverage['/combobox/control.js'].lineData[656]++;
        menu.addChild(v);
      }
      _$jscoverage['/combobox/control.js'].lineData[659]++;
      children = menu.get('children');
      _$jscoverage['/combobox/control.js'].lineData[662]++;
      val = self['getValueForAutocomplete']();
      _$jscoverage['/combobox/control.js'].lineData[664]++;
      if (visit55_664_1(self.get('highlightMatchItem'))) {
        _$jscoverage['/combobox/control.js'].lineData[665]++;
        for (i = 0; visit56_665_1(i < children.length); i++) {
          _$jscoverage['/combobox/control.js'].lineData[666]++;
          if (visit57_666_1(children[i].get("textContent") == val)) {
            _$jscoverage['/combobox/control.js'].lineData[667]++;
            children[i].set('highlighted', true);
            _$jscoverage['/combobox/control.js'].lineData[668]++;
            matchVal = true;
            _$jscoverage['/combobox/control.js'].lineData[669]++;
            break;
          }
        }
      }
      _$jscoverage['/combobox/control.js'].lineData[675]++;
      if (visit58_675_1(!matchVal && self.get("autoHighlightFirst"))) {
        _$jscoverage['/combobox/control.js'].lineData[676]++;
        for (i = 0; visit59_676_1(i < children.length); i++) {
          _$jscoverage['/combobox/control.js'].lineData[677]++;
          if (visit60_677_1(!children[i].get("disabled"))) {
            _$jscoverage['/combobox/control.js'].lineData[678]++;
            children[i].set('highlighted', true);
            _$jscoverage['/combobox/control.js'].lineData[679]++;
            break;
          }
        }
      }
      _$jscoverage['/combobox/control.js'].lineData[684]++;
      self.set("collapsed", false);
    } else {
      _$jscoverage['/combobox/control.js'].lineData[686]++;
      self.set("collapsed", true);
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[692]++;
  return ComboBox;
}, {
  requires: ['node', 'component/control', './render', 'menu']});
