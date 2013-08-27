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
if (! _$jscoverage['/dialog.js']) {
  _$jscoverage['/dialog.js'] = {};
  _$jscoverage['/dialog.js'].lineData = [];
  _$jscoverage['/dialog.js'].lineData[5] = 0;
  _$jscoverage['/dialog.js'].lineData[6] = 0;
  _$jscoverage['/dialog.js'].lineData[152] = 0;
  _$jscoverage['/dialog.js'].lineData[153] = 0;
  _$jscoverage['/dialog.js'].lineData[158] = 0;
  _$jscoverage['/dialog.js'].lineData[159] = 0;
  _$jscoverage['/dialog.js'].lineData[162] = 0;
  _$jscoverage['/dialog.js'].lineData[163] = 0;
  _$jscoverage['/dialog.js'].lineData[164] = 0;
  _$jscoverage['/dialog.js'].lineData[165] = 0;
  _$jscoverage['/dialog.js'].lineData[168] = 0;
  _$jscoverage['/dialog.js'].lineData[170] = 0;
  _$jscoverage['/dialog.js'].lineData[181] = 0;
  _$jscoverage['/dialog.js'].lineData[182] = 0;
  _$jscoverage['/dialog.js'].lineData[183] = 0;
  _$jscoverage['/dialog.js'].lineData[184] = 0;
  _$jscoverage['/dialog.js'].lineData[185] = 0;
  _$jscoverage['/dialog.js'].lineData[193] = 0;
  _$jscoverage['/dialog.js'].lineData[194] = 0;
  _$jscoverage['/dialog.js'].lineData[195] = 0;
  _$jscoverage['/dialog.js'].lineData[203] = 0;
  _$jscoverage['/dialog.js'].lineData[204] = 0;
  _$jscoverage['/dialog.js'].lineData[205] = 0;
  _$jscoverage['/dialog.js'].lineData[206] = 0;
  _$jscoverage['/dialog.js'].lineData[208] = 0;
  _$jscoverage['/dialog.js'].lineData[216] = 0;
  _$jscoverage['/dialog.js'].lineData[217] = 0;
  _$jscoverage['/dialog.js'].lineData[219] = 0;
  _$jscoverage['/dialog.js'].lineData[220] = 0;
  _$jscoverage['/dialog.js'].lineData[221] = 0;
  _$jscoverage['/dialog.js'].lineData[223] = 0;
  _$jscoverage['/dialog.js'].lineData[226] = 0;
  _$jscoverage['/dialog.js'].lineData[227] = 0;
  _$jscoverage['/dialog.js'].lineData[231] = 0;
  _$jscoverage['/dialog.js'].lineData[232] = 0;
  _$jscoverage['/dialog.js'].lineData[233] = 0;
  _$jscoverage['/dialog.js'].lineData[239] = 0;
  _$jscoverage['/dialog.js'].lineData[240] = 0;
  _$jscoverage['/dialog.js'].lineData[243] = 0;
  _$jscoverage['/dialog.js'].lineData[244] = 0;
  _$jscoverage['/dialog.js'].lineData[245] = 0;
  _$jscoverage['/dialog.js'].lineData[246] = 0;
  _$jscoverage['/dialog.js'].lineData[247] = 0;
  _$jscoverage['/dialog.js'].lineData[248] = 0;
  _$jscoverage['/dialog.js'].lineData[250] = 0;
  _$jscoverage['/dialog.js'].lineData[255] = 0;
  _$jscoverage['/dialog.js'].lineData[262] = 0;
  _$jscoverage['/dialog.js'].lineData[263] = 0;
  _$jscoverage['/dialog.js'].lineData[265] = 0;
  _$jscoverage['/dialog.js'].lineData[267] = 0;
  _$jscoverage['/dialog.js'].lineData[268] = 0;
  _$jscoverage['/dialog.js'].lineData[270] = 0;
  _$jscoverage['/dialog.js'].lineData[272] = 0;
  _$jscoverage['/dialog.js'].lineData[273] = 0;
  _$jscoverage['/dialog.js'].lineData[275] = 0;
  _$jscoverage['/dialog.js'].lineData[278] = 0;
  _$jscoverage['/dialog.js'].lineData[279] = 0;
  _$jscoverage['/dialog.js'].lineData[282] = 0;
  _$jscoverage['/dialog.js'].lineData[283] = 0;
  _$jscoverage['/dialog.js'].lineData[284] = 0;
  _$jscoverage['/dialog.js'].lineData[287] = 0;
  _$jscoverage['/dialog.js'].lineData[289] = 0;
  _$jscoverage['/dialog.js'].lineData[290] = 0;
  _$jscoverage['/dialog.js'].lineData[292] = 0;
  _$jscoverage['/dialog.js'].lineData[295] = 0;
  _$jscoverage['/dialog.js'].lineData[296] = 0;
  _$jscoverage['/dialog.js'].lineData[297] = 0;
  _$jscoverage['/dialog.js'].lineData[298] = 0;
  _$jscoverage['/dialog.js'].lineData[299] = 0;
  _$jscoverage['/dialog.js'].lineData[300] = 0;
  _$jscoverage['/dialog.js'].lineData[304] = 0;
  _$jscoverage['/dialog.js'].lineData[305] = 0;
  _$jscoverage['/dialog.js'].lineData[311] = 0;
  _$jscoverage['/dialog.js'].lineData[312] = 0;
  _$jscoverage['/dialog.js'].lineData[317] = 0;
  _$jscoverage['/dialog.js'].lineData[328] = 0;
  _$jscoverage['/dialog.js'].lineData[329] = 0;
  _$jscoverage['/dialog.js'].lineData[331] = 0;
  _$jscoverage['/dialog.js'].lineData[332] = 0;
  _$jscoverage['/dialog.js'].lineData[334] = 0;
  _$jscoverage['/dialog.js'].lineData[337] = 0;
  _$jscoverage['/dialog.js'].lineData[338] = 0;
  _$jscoverage['/dialog.js'].lineData[342] = 0;
  _$jscoverage['/dialog.js'].lineData[343] = 0;
  _$jscoverage['/dialog.js'].lineData[346] = 0;
  _$jscoverage['/dialog.js'].lineData[347] = 0;
  _$jscoverage['/dialog.js'].lineData[350] = 0;
  _$jscoverage['/dialog.js'].lineData[352] = 0;
  _$jscoverage['/dialog.js'].lineData[354] = 0;
  _$jscoverage['/dialog.js'].lineData[357] = 0;
  _$jscoverage['/dialog.js'].lineData[358] = 0;
  _$jscoverage['/dialog.js'].lineData[360] = 0;
  _$jscoverage['/dialog.js'].lineData[361] = 0;
  _$jscoverage['/dialog.js'].lineData[364] = 0;
  _$jscoverage['/dialog.js'].lineData[365] = 0;
  _$jscoverage['/dialog.js'].lineData[366] = 0;
  _$jscoverage['/dialog.js'].lineData[369] = 0;
  _$jscoverage['/dialog.js'].lineData[370] = 0;
  _$jscoverage['/dialog.js'].lineData[371] = 0;
  _$jscoverage['/dialog.js'].lineData[372] = 0;
  _$jscoverage['/dialog.js'].lineData[373] = 0;
  _$jscoverage['/dialog.js'].lineData[375] = 0;
  _$jscoverage['/dialog.js'].lineData[376] = 0;
  _$jscoverage['/dialog.js'].lineData[377] = 0;
  _$jscoverage['/dialog.js'].lineData[380] = 0;
  _$jscoverage['/dialog.js'].lineData[381] = 0;
  _$jscoverage['/dialog.js'].lineData[382] = 0;
  _$jscoverage['/dialog.js'].lineData[383] = 0;
  _$jscoverage['/dialog.js'].lineData[384] = 0;
  _$jscoverage['/dialog.js'].lineData[386] = 0;
  _$jscoverage['/dialog.js'].lineData[388] = 0;
  _$jscoverage['/dialog.js'].lineData[389] = 0;
  _$jscoverage['/dialog.js'].lineData[391] = 0;
  _$jscoverage['/dialog.js'].lineData[392] = 0;
  _$jscoverage['/dialog.js'].lineData[395] = 0;
  _$jscoverage['/dialog.js'].lineData[399] = 0;
  _$jscoverage['/dialog.js'].lineData[400] = 0;
  _$jscoverage['/dialog.js'].lineData[405] = 0;
  _$jscoverage['/dialog.js'].lineData[409] = 0;
  _$jscoverage['/dialog.js'].lineData[411] = 0;
  _$jscoverage['/dialog.js'].lineData[414] = 0;
  _$jscoverage['/dialog.js'].lineData[417] = 0;
  _$jscoverage['/dialog.js'].lineData[418] = 0;
  _$jscoverage['/dialog.js'].lineData[419] = 0;
  _$jscoverage['/dialog.js'].lineData[421] = 0;
  _$jscoverage['/dialog.js'].lineData[424] = 0;
  _$jscoverage['/dialog.js'].lineData[426] = 0;
  _$jscoverage['/dialog.js'].lineData[427] = 0;
  _$jscoverage['/dialog.js'].lineData[428] = 0;
  _$jscoverage['/dialog.js'].lineData[430] = 0;
  _$jscoverage['/dialog.js'].lineData[431] = 0;
  _$jscoverage['/dialog.js'].lineData[435] = 0;
  _$jscoverage['/dialog.js'].lineData[436] = 0;
  _$jscoverage['/dialog.js'].lineData[438] = 0;
  _$jscoverage['/dialog.js'].lineData[441] = 0;
  _$jscoverage['/dialog.js'].lineData[445] = 0;
  _$jscoverage['/dialog.js'].lineData[446] = 0;
  _$jscoverage['/dialog.js'].lineData[449] = 0;
  _$jscoverage['/dialog.js'].lineData[450] = 0;
  _$jscoverage['/dialog.js'].lineData[453] = 0;
  _$jscoverage['/dialog.js'].lineData[454] = 0;
  _$jscoverage['/dialog.js'].lineData[456] = 0;
  _$jscoverage['/dialog.js'].lineData[457] = 0;
  _$jscoverage['/dialog.js'].lineData[459] = 0;
  _$jscoverage['/dialog.js'].lineData[461] = 0;
  _$jscoverage['/dialog.js'].lineData[464] = 0;
  _$jscoverage['/dialog.js'].lineData[465] = 0;
  _$jscoverage['/dialog.js'].lineData[468] = 0;
  _$jscoverage['/dialog.js'].lineData[469] = 0;
  _$jscoverage['/dialog.js'].lineData[470] = 0;
  _$jscoverage['/dialog.js'].lineData[473] = 0;
  _$jscoverage['/dialog.js'].lineData[477] = 0;
}
if (! _$jscoverage['/dialog.js'].functionData) {
  _$jscoverage['/dialog.js'].functionData = [];
  _$jscoverage['/dialog.js'].functionData[0] = 0;
  _$jscoverage['/dialog.js'].functionData[1] = 0;
  _$jscoverage['/dialog.js'].functionData[2] = 0;
  _$jscoverage['/dialog.js'].functionData[3] = 0;
  _$jscoverage['/dialog.js'].functionData[4] = 0;
  _$jscoverage['/dialog.js'].functionData[5] = 0;
  _$jscoverage['/dialog.js'].functionData[6] = 0;
  _$jscoverage['/dialog.js'].functionData[7] = 0;
  _$jscoverage['/dialog.js'].functionData[8] = 0;
  _$jscoverage['/dialog.js'].functionData[9] = 0;
  _$jscoverage['/dialog.js'].functionData[10] = 0;
  _$jscoverage['/dialog.js'].functionData[11] = 0;
  _$jscoverage['/dialog.js'].functionData[12] = 0;
  _$jscoverage['/dialog.js'].functionData[13] = 0;
  _$jscoverage['/dialog.js'].functionData[14] = 0;
}
if (! _$jscoverage['/dialog.js'].branchData) {
  _$jscoverage['/dialog.js'].branchData = {};
  _$jscoverage['/dialog.js'].branchData['159'] = [];
  _$jscoverage['/dialog.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['220'] = [];
  _$jscoverage['/dialog.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['226'] = [];
  _$jscoverage['/dialog.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['231'] = [];
  _$jscoverage['/dialog.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['234'] = [];
  _$jscoverage['/dialog.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['235'] = [];
  _$jscoverage['/dialog.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['235'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['236'] = [];
  _$jscoverage['/dialog.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['244'] = [];
  _$jscoverage['/dialog.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['247'] = [];
  _$jscoverage['/dialog.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['262'] = [];
  _$jscoverage['/dialog.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['267'] = [];
  _$jscoverage['/dialog.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['272'] = [];
  _$jscoverage['/dialog.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['272'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['278'] = [];
  _$jscoverage['/dialog.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['283'] = [];
  _$jscoverage['/dialog.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['289'] = [];
  _$jscoverage['/dialog.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['295'] = [];
  _$jscoverage['/dialog.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['296'] = [];
  _$jscoverage['/dialog.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['297'] = [];
  _$jscoverage['/dialog.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['299'] = [];
  _$jscoverage['/dialog.js'].branchData['299'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['311'] = [];
  _$jscoverage['/dialog.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['321'] = [];
  _$jscoverage['/dialog.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['322'] = [];
  _$jscoverage['/dialog.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['328'] = [];
  _$jscoverage['/dialog.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['331'] = [];
  _$jscoverage['/dialog.js'].branchData['331'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['337'] = [];
  _$jscoverage['/dialog.js'].branchData['337'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['342'] = [];
  _$jscoverage['/dialog.js'].branchData['342'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['346'] = [];
  _$jscoverage['/dialog.js'].branchData['346'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['352'] = [];
  _$jscoverage['/dialog.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['353'] = [];
  _$jscoverage['/dialog.js'].branchData['353'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['357'] = [];
  _$jscoverage['/dialog.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['360'] = [];
  _$jscoverage['/dialog.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['365'] = [];
  _$jscoverage['/dialog.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['369'] = [];
  _$jscoverage['/dialog.js'].branchData['369'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['372'] = [];
  _$jscoverage['/dialog.js'].branchData['372'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['381'] = [];
  _$jscoverage['/dialog.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['383'] = [];
  _$jscoverage['/dialog.js'].branchData['383'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['399'] = [];
  _$jscoverage['/dialog.js'].branchData['399'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['401'] = [];
  _$jscoverage['/dialog.js'].branchData['401'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['405'] = [];
  _$jscoverage['/dialog.js'].branchData['405'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['409'] = [];
  _$jscoverage['/dialog.js'].branchData['409'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['411'] = [];
  _$jscoverage['/dialog.js'].branchData['411'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['418'] = [];
  _$jscoverage['/dialog.js'].branchData['418'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['424'] = [];
  _$jscoverage['/dialog.js'].branchData['424'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['427'] = [];
  _$jscoverage['/dialog.js'].branchData['427'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['445'] = [];
  _$jscoverage['/dialog.js'].branchData['445'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['456'] = [];
  _$jscoverage['/dialog.js'].branchData['456'][1] = new BranchData();
}
_$jscoverage['/dialog.js'].branchData['456'][1].init(676, 15, 'self.selectedTd');
function visit48_456_1(result) {
  _$jscoverage['/dialog.js'].branchData['456'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['445'][1].init(143, 18, 'self.selectedTable');
function visit47_445_1(result) {
  _$jscoverage['/dialog.js'].branchData['445'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['427'][1].init(1138, 7, 'caption');
function visit46_427_1(result) {
  _$jscoverage['/dialog.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['424'][1].init(-1, 35, 'selectedTable.style("height") || ""');
function visit45_424_1(result) {
  _$jscoverage['/dialog.js'].branchData['424'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['418'][1].init(828, 20, 'w.indexOf("%") != -1');
function visit44_418_1(result) {
  _$jscoverage['/dialog.js'].branchData['418'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['411'][1].init(555, 77, 'selectedTable.style("width") || ("" + selectedTable.width())');
function visit43_411_1(result) {
  _$jscoverage['/dialog.js'].branchData['411'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['409'][1].init(479, 52, 'selectedTable.attr("border") || "0"');
function visit42_409_1(result) {
  _$jscoverage['/dialog.js'].branchData['409'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['405'][1].init(395, 50, 'selectedTable.attr("align") || ""');
function visit41_405_1(result) {
  _$jscoverage['/dialog.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['401'][1].init(39, 72, 'parseInt(self.selectedTd.css("padding")) || "0"');
function visit40_401_1(result) {
  _$jscoverage['/dialog.js'].branchData['401'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['399'][1].init(192, 15, 'self.selectedTd');
function visit39_399_1(result) {
  _$jscoverage['/dialog.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['383'][1].init(63, 8, 'i < cols');
function visit38_383_1(result) {
  _$jscoverage['/dialog.js'].branchData['383'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['381'][1].init(2167, 8, 'r < rows');
function visit37_381_1(result) {
  _$jscoverage['/dialog.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['372'][1].init(99, 8, 'i < cols');
function visit36_372_1(result) {
  _$jscoverage['/dialog.js'].branchData['372'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['369'][1].init(1775, 20, 'd.thead.get("value")');
function visit35_369_1(result) {
  _$jscoverage['/dialog.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['365'][1].init(1579, 23, 'valid(d.tcaption.val())');
function visit34_365_1(result) {
  _$jscoverage['/dialog.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['360'][1].init(1438, 14, 'classes.length');
function visit33_360_1(result) {
  _$jscoverage['/dialog.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['357'][1].init(1329, 22, 'd.tcollapse[0].checked');
function visit32_357_1(result) {
  _$jscoverage['/dialog.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['353'][1].init(43, 36, 'String(trim(d.tborder.val())) == "0"');
function visit31_353_1(result) {
  _$jscoverage['/dialog.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['352'][1].init(1159, 80, '!valid(d.tborder.val()) || String(trim(d.tborder.val())) == "0"');
function visit30_352_1(result) {
  _$jscoverage['/dialog.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['346'][1].init(1014, 13, 'styles.length');
function visit29_346_1(result) {
  _$jscoverage['/dialog.js'].branchData['346'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['342'][1].init(881, 22, 'valid(d.theight.val())');
function visit28_342_1(result) {
  _$jscoverage['/dialog.js'].branchData['342'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['337'][1].init(704, 21, 'valid(d.twidth.val())');
function visit27_337_1(result) {
  _$jscoverage['/dialog.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['331'][1].init(559, 22, 'valid(d.tborder.val())');
function visit26_331_1(result) {
  _$jscoverage['/dialog.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['328'][1].init(437, 28, 'valid(d.talign.get("value"))');
function visit25_328_1(result) {
  _$jscoverage['/dialog.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['322'][1].init(183, 28, 'parseInt(d.trows.val()) || 1');
function visit24_322_1(result) {
  _$jscoverage['/dialog.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['321'][1].init(129, 28, 'parseInt(d.tcols.val()) || 1');
function visit23_321_1(result) {
  _$jscoverage['/dialog.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['311'][1].init(2422, 7, 'caption');
function visit22_311_1(result) {
  _$jscoverage['/dialog.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['299'][1].init(98, 21, 'caption && caption[0]');
function visit21_299_1(result) {
  _$jscoverage['/dialog.js'].branchData['299'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['297'][1].init(1711, 23, 'valid(d.tcaption.val())');
function visit20_297_1(result) {
  _$jscoverage['/dialog.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['296'][1].init(1625, 15, 'self.selectedTd');
function visit19_296_1(result) {
  _$jscoverage['/dialog.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['295'][1].init(1571, 34, 'parseInt(d.cellpadding.val()) || 0');
function visit18_295_1(result) {
  _$jscoverage['/dialog.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['289'][1].init(1328, 22, 'd.tcollapse[0].checked');
function visit17_289_1(result) {
  _$jscoverage['/dialog.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['283'][1].init(1127, 22, 'valid(d.theight.val())');
function visit16_283_1(result) {
  _$jscoverage['/dialog.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['278'][1].init(904, 21, 'valid(d.twidth.val())');
function visit15_278_1(result) {
  _$jscoverage['/dialog.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['272'][2].init(678, 17, 'tborderVal == "0"');
function visit14_272_2(result) {
  _$jscoverage['/dialog.js'].branchData['272'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['272'][1].init(656, 39, '!valid(tborderVal) || tborderVal == "0"');
function visit13_272_1(result) {
  _$jscoverage['/dialog.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['267'][1].init(463, 17, 'valid(tborderVal)');
function visit12_267_1(result) {
  _$jscoverage['/dialog.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['262'][1].init(293, 16, 'valid(talignVal)');
function visit11_262_1(result) {
  _$jscoverage['/dialog.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['247'][1].init(22, 19, '!self.selectedTable');
function visit10_247_1(result) {
  _$jscoverage['/dialog.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['244'][1].init(661, 3, '!re');
function visit9_244_1(result) {
  _$jscoverage['/dialog.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['236'][1].init(40, 6, 'tw < 0');
function visit8_236_1(result) {
  _$jscoverage['/dialog.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['235'][2].init(34, 8, 'tw > 100');
function visit7_235_2(result) {
  _$jscoverage['/dialog.js'].branchData['235'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['235'][1].init(-1, 47, 'tw > 100 || tw < 0');
function visit6_235_1(result) {
  _$jscoverage['/dialog.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['234'][1].init(25, 108, '!tw || (tw > 100 || tw < 0)');
function visit5_234_1(result) {
  _$jscoverage['/dialog.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['231'][1].init(186, 42, 'tableDialog.twidthunit.get("value") == "%"');
function visit4_231_1(result) {
  _$jscoverage['/dialog.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['226'][1].init(14, 15, 'ev && ev.halt()');
function visit3_226_1(result) {
  _$jscoverage['/dialog.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['220'][1].init(18, 15, 'ev && ev.halt()');
function visit2_220_1(result) {
  _$jscoverage['/dialog.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['159'][1].init(17, 21, 'trim(str).length != 0');
function visit1_159_1(result) {
  _$jscoverage['/dialog.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].lineData[5]++;
KISSY.add("editor/plugin/table/dialog", function(S, Editor, Dialog4E, MenuButton) {
  _$jscoverage['/dialog.js'].functionData[0]++;
  _$jscoverage['/dialog.js'].lineData[6]++;
  var Node = S.Node, Dom = S.DOM, trim = S.trim, showBorderClassName = "ke_show_border", collapseTableClass = "k-e-collapse-table", IN_SIZE = 6, alignStyle = 'margin:0 5px 0 0;', TABLE_HTML = "<div style='padding:20px 20px 10px 20px;'>" + "<table class='{prefixCls}editor-table-config' style='width:100%'>" + "<tr>" + "<td>" + "<label>\u884c\u6570\uff1a " + "<input " + " data-verify='^(?!0$)\\d+$' " + " data-warning='\u884c\u6570\u8bf7\u8f93\u5165\u6b63\u6574\u6570' " + " value='2' " + " class='{prefixCls}editor-table-rows {prefixCls}editor-table-create-only {prefixCls}editor-input' " + "style='" + alignStyle + "'" + " size='" + IN_SIZE + "'" + " />" + "</label>" + "</td>" + "<td>" + "<label>\u5bbd&nbsp;&nbsp;&nbsp;\u5ea6\uff1a " + "</label> " + "<input " + " data-verify='^(?!0$)\\d+$' " + " data-warning='\u5bbd\u5ea6\u8bf7\u8f93\u5165\u6b63\u6574\u6570' " + "value='200' " + "style='" + alignStyle + "' " + "class='{prefixCls}editor-table-width {prefixCls}editor-input' " + "size='" + IN_SIZE + "'/>" + "<select class='{prefixCls}editor-table-width-unit' title='\u5bbd\u5ea6\u5355\u4f4d'>" + "<option value='px'>\u50cf\u7d20</option>" + "<option value='%'>\u767e\u5206\u6bd4</option>" + "</select>" + "</td>" + "</tr>" + "<tr>" + "<td>" + "<label>\u5217\u6570\uff1a " + "<input " + " data-verify='^(?!0$)\\d+$' " + " data-warning='\u5217\u6570\u8bf7\u8f93\u5165\u6b63\u6574\u6570' " + "class='{prefixCls}editor-table-cols {prefixCls}editor-table-create-only {prefixCls}editor-input' " + "style='" + alignStyle + "'" + "value='3' " + "size='" + IN_SIZE + "'/>" + "</label>" + "</td>" + "<td>" + "<label>" + "\u9ad8&nbsp;&nbsp;&nbsp;\u5ea6\uff1a " + "</label>" + "<input " + " data-verify='^((?!0$)\\d+)?$' " + " data-warning='\u9ad8\u5ea6\u8bf7\u8f93\u5165\u6b63\u6574\u6570' " + "value='' " + "style='" + alignStyle + "'" + "class='{prefixCls}editor-table-height {prefixCls}editor-input' " + "size='" + IN_SIZE + "'/>" + " &nbsp;\u50cf\u7d20" + "</td>" + "</tr>" + "<tr>" + "<td>" + "<label>\u5bf9\u9f50\uff1a </label>" + "<select class='{prefixCls}editor-table-align' title='\u5bf9\u9f50'>" + "<option value=''>\u65e0</option>" + "<option value='left'>\u5de6\u5bf9\u9f50</option>" + "<option value='right'>\u53f3\u5bf9\u9f50</option>" + "<option value='center'>\u4e2d\u95f4\u5bf9\u9f50</option>" + "</select>" + "</td>" + "<td>" + "<label>\u6807\u9898\u683c\uff1a</label> " + "<select class='{prefixCls}editor-table-head {prefixCls}editor-table-create-only' title='\u6807\u9898\u683c'>" + "<option value=''>\u65e0</option>" + "<option value='1'>\u6709</option>" + "</select>" + "</td>" + "</tr>" + "<tr>" + "<td>" + "<label>\u8fb9\u6846\uff1a " + "<input " + " data-verify='^\\d+$' " + " data-warning='\u8fb9\u6846\u8bf7\u8f93\u5165\u975e\u8d1f\u6574\u6570' " + "value='1' " + "style='" + alignStyle + "'" + "class='{prefixCls}editor-table-border {prefixCls}editor-input' " + "size='" + IN_SIZE + "'/>" + "</label> &nbsp;\u50cf\u7d20" + " " + '<label><input ' + 'type="checkbox" ' + 'style="vertical-align: middle; margin-left: 5px;" ' + 'class="{prefixCls}editor-table-collapse" ' + '/> \u5408\u5e76\u8fb9\u6846' + "</label>" + "</td>" + "<td>" + "<label " + "class='{prefixCls}editor-table-cellpadding-holder'" + ">\u8fb9&nbsp;&nbsp;&nbsp;\u8ddd\uff1a " + "<input " + " data-verify='^(\\d+)?$' " + " data-warning='\u8fb9\u6846\u8bf7\u8f93\u5165\u975e\u8d1f\u6574\u6570' " + "value='0' " + "style='" + alignStyle + "'" + "class='{prefixCls}editor-table-cellpadding {prefixCls}editor-input' " + "size='" + IN_SIZE + "'/>" + " &nbsp;\u50cf\u7d20</label>" + "</td>" + "</tr>" + "<tr>" + "<td colspan='2'>" + "<label>" + "\u6807\u9898\uff1a " + "<input " + "class='{prefixCls}editor-table-caption {prefixCls}editor-input' " + "style='width:380px;" + alignStyle + "'>" + "</label>" + "</td>" + "</tr>" + "</table>" + "</div>", footHTML = "<div style='padding:5px 20px 20px;'>" + "<a " + "class='{prefixCls}editor-table-ok {prefixCls}editor-button ks-inline-block' " + "style='margin-right:20px;'>\u786e\u5b9a</a> " + "<a " + "class='{prefixCls}editor-table-cancel {prefixCls}editor-button ks-inline-block'>\u53d6\u6d88</a>" + "</div>", addRes = Editor.Utils.addRes, destroyRes = Editor.Utils.destroyRes;
  _$jscoverage['/dialog.js'].lineData[152]++;
  function replacePrefix(str, prefix) {
    _$jscoverage['/dialog.js'].functionData[1]++;
    _$jscoverage['/dialog.js'].lineData[153]++;
    return S.substitute(str, {
  prefixCls: prefix});
  }
  _$jscoverage['/dialog.js'].lineData[158]++;
  function valid(str) {
    _$jscoverage['/dialog.js'].functionData[2]++;
    _$jscoverage['/dialog.js'].lineData[159]++;
    return visit1_159_1(trim(str).length != 0);
  }
  _$jscoverage['/dialog.js'].lineData[162]++;
  function TableDialog(editor) {
    _$jscoverage['/dialog.js'].functionData[3]++;
    _$jscoverage['/dialog.js'].lineData[163]++;
    var self = this;
    _$jscoverage['/dialog.js'].lineData[164]++;
    self.editor = editor;
    _$jscoverage['/dialog.js'].lineData[165]++;
    Editor.Utils.lazyRun(self, "_prepareTableShow", "_realTableShow");
  }
  _$jscoverage['/dialog.js'].lineData[168]++;
  S.augment(TableDialog, {
  _tableInit: function() {
  _$jscoverage['/dialog.js'].functionData[4]++;
  _$jscoverage['/dialog.js'].lineData[170]++;
  var self = this, prefixCls = self.editor.get('prefixCls'), d = new Dialog4E({
  width: "500px", 
  mask: true, 
  headerContent: "\u8868\u683c", 
  bodyContent: replacePrefix(TABLE_HTML, prefixCls), 
  footerContent: replacePrefix(footHTML, prefixCls)}).render(), dbody = d.get("body"), foot = d.get("footer");
  _$jscoverage['/dialog.js'].lineData[181]++;
  d.twidth = dbody.one(replacePrefix(".{prefixCls}editor-table-width", prefixCls));
  _$jscoverage['/dialog.js'].lineData[182]++;
  d.theight = dbody.one(replacePrefix(".{prefixCls}editor-table-height", prefixCls));
  _$jscoverage['/dialog.js'].lineData[183]++;
  d.tborder = dbody.one(replacePrefix(".{prefixCls}editor-table-border", prefixCls));
  _$jscoverage['/dialog.js'].lineData[184]++;
  d.tcaption = dbody.one(replacePrefix(".{prefixCls}editor-table-caption", prefixCls));
  _$jscoverage['/dialog.js'].lineData[185]++;
  d.talign = MenuButton.Select.decorate(dbody.one(replacePrefix(".{prefixCls}editor-table-align", prefixCls)), {
  prefixCls: replacePrefix('{prefixCls}editor-big-', prefixCls), 
  width: 80, 
  menuCfg: {
  prefixCls: replacePrefix('{prefixCls}editor-', prefixCls), 
  render: dbody}});
  _$jscoverage['/dialog.js'].lineData[193]++;
  d.trows = dbody.one(replacePrefix(".{prefixCls}editor-table-rows", prefixCls));
  _$jscoverage['/dialog.js'].lineData[194]++;
  d.tcols = dbody.one(replacePrefix(".{prefixCls}editor-table-cols", prefixCls));
  _$jscoverage['/dialog.js'].lineData[195]++;
  d.thead = MenuButton.Select.decorate(dbody.one(replacePrefix(".{prefixCls}editor-table-head", prefixCls)), {
  prefixCls: replacePrefix('{prefixCls}editor-big-', prefixCls), 
  width: 80, 
  menuCfg: {
  prefixCls: replacePrefix('{prefixCls}editor-', prefixCls), 
  render: dbody}});
  _$jscoverage['/dialog.js'].lineData[203]++;
  d.cellpaddingHolder = dbody.one(replacePrefix(".{prefixCls}editor-table-cellpadding-holder", prefixCls));
  _$jscoverage['/dialog.js'].lineData[204]++;
  d.cellpadding = dbody.one(replacePrefix(".{prefixCls}editor-table-cellpadding", prefixCls));
  _$jscoverage['/dialog.js'].lineData[205]++;
  d.tcollapse = dbody.one(replacePrefix(".{prefixCls}editor-table-collapse", prefixCls));
  _$jscoverage['/dialog.js'].lineData[206]++;
  var tok = foot.one(replacePrefix(".{prefixCls}editor-table-ok", prefixCls)), tclose = foot.one(replacePrefix(".{prefixCls}editor-table-cancel", prefixCls));
  _$jscoverage['/dialog.js'].lineData[208]++;
  d.twidthunit = MenuButton.Select.decorate(dbody.one(replacePrefix(".{prefixCls}editor-table-width-unit", prefixCls)), {
  prefixCls: replacePrefix('{prefixCls}editor-big-', prefixCls), 
  width: 80, 
  menuCfg: {
  prefixCls: replacePrefix('{prefixCls}editor-', prefixCls), 
  render: dbody}});
  _$jscoverage['/dialog.js'].lineData[216]++;
  self.dialog = d;
  _$jscoverage['/dialog.js'].lineData[217]++;
  tok.on("click", self._tableOk, self);
  _$jscoverage['/dialog.js'].lineData[219]++;
  tclose.on("click", function(ev) {
  _$jscoverage['/dialog.js'].functionData[5]++;
  _$jscoverage['/dialog.js'].lineData[220]++;
  visit2_220_1(ev && ev.halt());
  _$jscoverage['/dialog.js'].lineData[221]++;
  d.hide();
});
  _$jscoverage['/dialog.js'].lineData[223]++;
  addRes.call(self, d, d.twidthunit, tok, tclose);
}, 
  _tableOk: function(ev) {
  _$jscoverage['/dialog.js'].functionData[6]++;
  _$jscoverage['/dialog.js'].lineData[226]++;
  visit3_226_1(ev && ev.halt());
  _$jscoverage['/dialog.js'].lineData[227]++;
  var self = this, tableDialog = self.dialog, inputs = tableDialog.get("el").all("input");
  _$jscoverage['/dialog.js'].lineData[231]++;
  if (visit4_231_1(tableDialog.twidthunit.get("value") == "%")) {
    _$jscoverage['/dialog.js'].lineData[232]++;
    var tw = parseInt(tableDialog.twidth.val());
    _$jscoverage['/dialog.js'].lineData[233]++;
    if (visit5_234_1(!tw || (visit6_235_1(visit7_235_2(tw > 100) || visit8_236_1(tw < 0))))) {
      _$jscoverage['/dialog.js'].lineData[239]++;
      alert("\u5bbd\u5ea6\u767e\u5206\u6bd4\uff1a" + "\u8bf7\u8f93\u51651-100\u4e4b\u95f4");
      _$jscoverage['/dialog.js'].lineData[240]++;
      return;
    }
  }
  _$jscoverage['/dialog.js'].lineData[243]++;
  var re = Editor.Utils.verifyInputs(inputs);
  _$jscoverage['/dialog.js'].lineData[244]++;
  if (visit9_244_1(!re)) 
    return;
  _$jscoverage['/dialog.js'].lineData[245]++;
  self.dialog.hide();
  _$jscoverage['/dialog.js'].lineData[246]++;
  setTimeout(function() {
  _$jscoverage['/dialog.js'].functionData[7]++;
  _$jscoverage['/dialog.js'].lineData[247]++;
  if (visit10_247_1(!self.selectedTable)) {
    _$jscoverage['/dialog.js'].lineData[248]++;
    self._genTable();
  } else {
    _$jscoverage['/dialog.js'].lineData[250]++;
    self._modifyTable();
  }
}, 0);
}, 
  _modifyTable: function() {
  _$jscoverage['/dialog.js'].functionData[8]++;
  _$jscoverage['/dialog.js'].lineData[255]++;
  var self = this, d = self.dialog, selectedTable = self.selectedTable, caption = selectedTable.one("caption"), talignVal = d.talign.get("value"), tborderVal = d.tborder.val();
  _$jscoverage['/dialog.js'].lineData[262]++;
  if (visit11_262_1(valid(talignVal))) {
    _$jscoverage['/dialog.js'].lineData[263]++;
    selectedTable.attr("align", trim(talignVal));
  } else {
    _$jscoverage['/dialog.js'].lineData[265]++;
    selectedTable.removeAttr("align");
  }
  _$jscoverage['/dialog.js'].lineData[267]++;
  if (visit12_267_1(valid(tborderVal))) {
    _$jscoverage['/dialog.js'].lineData[268]++;
    selectedTable.attr("border", trim(tborderVal));
  } else {
    _$jscoverage['/dialog.js'].lineData[270]++;
    selectedTable.removeAttr("border");
  }
  _$jscoverage['/dialog.js'].lineData[272]++;
  if (visit13_272_1(!valid(tborderVal) || visit14_272_2(tborderVal == "0"))) {
    _$jscoverage['/dialog.js'].lineData[273]++;
    selectedTable.addClass(showBorderClassName, undefined);
  } else {
    _$jscoverage['/dialog.js'].lineData[275]++;
    selectedTable.removeClass(showBorderClassName, undefined);
  }
  _$jscoverage['/dialog.js'].lineData[278]++;
  if (visit15_278_1(valid(d.twidth.val()))) {
    _$jscoverage['/dialog.js'].lineData[279]++;
    selectedTable.css("width", trim(d.twidth.val()) + d.twidthunit.get("value"));
  } else {
    _$jscoverage['/dialog.js'].lineData[282]++;
    selectedTable.css("width", "");
  }
  _$jscoverage['/dialog.js'].lineData[283]++;
  if (visit16_283_1(valid(d.theight.val()))) {
    _$jscoverage['/dialog.js'].lineData[284]++;
    selectedTable.css("height", trim(d.theight.val()));
  } else {
    _$jscoverage['/dialog.js'].lineData[287]++;
    selectedTable.css("height", "");
  }
  _$jscoverage['/dialog.js'].lineData[289]++;
  if (visit17_289_1(d.tcollapse[0].checked)) {
    _$jscoverage['/dialog.js'].lineData[290]++;
    selectedTable.addClass(collapseTableClass, undefined);
  } else {
    _$jscoverage['/dialog.js'].lineData[292]++;
    selectedTable.removeClass(collapseTableClass, undefined);
  }
  _$jscoverage['/dialog.js'].lineData[295]++;
  d.cellpadding.val(visit18_295_1(parseInt(d.cellpadding.val()) || 0));
  _$jscoverage['/dialog.js'].lineData[296]++;
  if (visit19_296_1(self.selectedTd)) 
    self.selectedTd.css("padding", d.cellpadding.val());
  _$jscoverage['/dialog.js'].lineData[297]++;
  if (visit20_297_1(valid(d.tcaption.val()))) {
    _$jscoverage['/dialog.js'].lineData[298]++;
    var tcv = Editor.Utils.htmlEncode(trim(d.tcaption.val()));
    _$jscoverage['/dialog.js'].lineData[299]++;
    if (visit21_299_1(caption && caption[0])) {
      _$jscoverage['/dialog.js'].lineData[300]++;
      caption.html(tcv);
    } else {
      _$jscoverage['/dialog.js'].lineData[304]++;
      var c = selectedTable[0].createCaption();
      _$jscoverage['/dialog.js'].lineData[305]++;
      Dom.html(c, "<span>" + tcv + "</span>");
    }
  } else {
    _$jscoverage['/dialog.js'].lineData[311]++;
    if (visit22_311_1(caption)) {
      _$jscoverage['/dialog.js'].lineData[312]++;
      caption.remove();
    }
  }
}, 
  _genTable: function() {
  _$jscoverage['/dialog.js'].functionData[9]++;
  _$jscoverage['/dialog.js'].lineData[317]++;
  var self = this, d = self.dialog, html = "<table ", i, cols = visit23_321_1(parseInt(d.tcols.val()) || 1), rows = visit24_322_1(parseInt(d.trows.val()) || 1), cellPad = S.UA.ie ? '' : '<br/>', editor = self.editor;
  _$jscoverage['/dialog.js'].lineData[328]++;
  if (visit25_328_1(valid(d.talign.get("value")))) {
    _$jscoverage['/dialog.js'].lineData[329]++;
    html += "align='" + trim(d.talign.get("value")) + "' ";
  }
  _$jscoverage['/dialog.js'].lineData[331]++;
  if (visit26_331_1(valid(d.tborder.val()))) {
    _$jscoverage['/dialog.js'].lineData[332]++;
    html += "border='" + trim(d.tborder.val()) + "' ";
  }
  _$jscoverage['/dialog.js'].lineData[334]++;
  var styles = [];
  _$jscoverage['/dialog.js'].lineData[337]++;
  if (visit27_337_1(valid(d.twidth.val()))) {
    _$jscoverage['/dialog.js'].lineData[338]++;
    styles.push("width:" + trim(d.twidth.val()) + d.twidthunit.get("value") + ";");
  }
  _$jscoverage['/dialog.js'].lineData[342]++;
  if (visit28_342_1(valid(d.theight.val()))) {
    _$jscoverage['/dialog.js'].lineData[343]++;
    styles.push("height:" + trim(d.theight.val()) + "px;");
  }
  _$jscoverage['/dialog.js'].lineData[346]++;
  if (visit29_346_1(styles.length)) {
    _$jscoverage['/dialog.js'].lineData[347]++;
    html += "style='" + styles.join("") + "' ";
  }
  _$jscoverage['/dialog.js'].lineData[350]++;
  var classes = [];
  _$jscoverage['/dialog.js'].lineData[352]++;
  if (visit30_352_1(!valid(d.tborder.val()) || visit31_353_1(String(trim(d.tborder.val())) == "0"))) {
    _$jscoverage['/dialog.js'].lineData[354]++;
    classes.push(showBorderClassName);
  }
  _$jscoverage['/dialog.js'].lineData[357]++;
  if (visit32_357_1(d.tcollapse[0].checked)) {
    _$jscoverage['/dialog.js'].lineData[358]++;
    classes.push(collapseTableClass);
  }
  _$jscoverage['/dialog.js'].lineData[360]++;
  if (visit33_360_1(classes.length)) {
    _$jscoverage['/dialog.js'].lineData[361]++;
    html += "class='" + classes.join(" ") + "' ";
  }
  _$jscoverage['/dialog.js'].lineData[364]++;
  html += ">";
  _$jscoverage['/dialog.js'].lineData[365]++;
  if (visit34_365_1(valid(d.tcaption.val()))) {
    _$jscoverage['/dialog.js'].lineData[366]++;
    html += "<caption><span>" + Editor.Utils.htmlEncode(trim(d.tcaption.val())) + "</span></caption>";
  }
  _$jscoverage['/dialog.js'].lineData[369]++;
  if (visit35_369_1(d.thead.get("value"))) {
    _$jscoverage['/dialog.js'].lineData[370]++;
    html += "<thead>";
    _$jscoverage['/dialog.js'].lineData[371]++;
    html += "<tr>";
    _$jscoverage['/dialog.js'].lineData[372]++;
    for (i = 0; visit36_372_1(i < cols); i++) {
      _$jscoverage['/dialog.js'].lineData[373]++;
      html += "<th>" + cellPad + "</th>";
    }
    _$jscoverage['/dialog.js'].lineData[375]++;
    html += "</tr>";
    _$jscoverage['/dialog.js'].lineData[376]++;
    html += "</thead>";
    _$jscoverage['/dialog.js'].lineData[377]++;
    rows -= 1;
  }
  _$jscoverage['/dialog.js'].lineData[380]++;
  html += "<tbody>";
  _$jscoverage['/dialog.js'].lineData[381]++;
  for (var r = 0; visit37_381_1(r < rows); r++) {
    _$jscoverage['/dialog.js'].lineData[382]++;
    html += "<tr>";
    _$jscoverage['/dialog.js'].lineData[383]++;
    for (i = 0; visit38_383_1(i < cols); i++) {
      _$jscoverage['/dialog.js'].lineData[384]++;
      html += "<td>" + cellPad + "</td>";
    }
    _$jscoverage['/dialog.js'].lineData[386]++;
    html += "</tr>";
  }
  _$jscoverage['/dialog.js'].lineData[388]++;
  html += "</tbody>";
  _$jscoverage['/dialog.js'].lineData[389]++;
  html += "</table>";
  _$jscoverage['/dialog.js'].lineData[391]++;
  var table = new Node(html, null, editor.get("document")[0]);
  _$jscoverage['/dialog.js'].lineData[392]++;
  editor.insertElement(table);
}, 
  _fillTableDialog: function() {
  _$jscoverage['/dialog.js'].functionData[10]++;
  _$jscoverage['/dialog.js'].lineData[395]++;
  var self = this, d = self.dialog, selectedTable = self.selectedTable, caption = selectedTable.one("caption");
  _$jscoverage['/dialog.js'].lineData[399]++;
  if (visit39_399_1(self.selectedTd)) {
    _$jscoverage['/dialog.js'].lineData[400]++;
    d.cellpadding.val(visit40_401_1(parseInt(self.selectedTd.css("padding")) || "0"));
  }
  _$jscoverage['/dialog.js'].lineData[405]++;
  d.talign.set("value", visit41_405_1(selectedTable.attr("align") || ""));
  _$jscoverage['/dialog.js'].lineData[409]++;
  d.tborder.val(visit42_409_1(selectedTable.attr("border") || "0"));
  _$jscoverage['/dialog.js'].lineData[411]++;
  var w = visit43_411_1(selectedTable.style("width") || ("" + selectedTable.width()));
  _$jscoverage['/dialog.js'].lineData[414]++;
  d.tcollapse[0].checked = selectedTable.hasClass(collapseTableClass, undefined);
  _$jscoverage['/dialog.js'].lineData[417]++;
  d.twidth.val(w.replace(/px|%|(.*pt)/i, ""));
  _$jscoverage['/dialog.js'].lineData[418]++;
  if (visit44_418_1(w.indexOf("%") != -1)) {
    _$jscoverage['/dialog.js'].lineData[419]++;
    d.twidthunit.set("value", "%");
  } else {
    _$jscoverage['/dialog.js'].lineData[421]++;
    d.twidthunit.set("value", "px");
  }
  _$jscoverage['/dialog.js'].lineData[424]++;
  d.theight.val((visit45_424_1(selectedTable.style("height") || "")).replace(/px|%/i, ""));
  _$jscoverage['/dialog.js'].lineData[426]++;
  var c = "";
  _$jscoverage['/dialog.js'].lineData[427]++;
  if (visit46_427_1(caption)) {
    _$jscoverage['/dialog.js'].lineData[428]++;
    c = caption.text();
  }
  _$jscoverage['/dialog.js'].lineData[430]++;
  d.tcaption.val(c);
  _$jscoverage['/dialog.js'].lineData[431]++;
  var head = selectedTable.first("thead"), rowLength = (selectedTable.one("tbody") ? selectedTable.one("tbody").children().length : 0) + (head ? head.children("tr").length : 0);
  _$jscoverage['/dialog.js'].lineData[435]++;
  d.trows.val(rowLength);
  _$jscoverage['/dialog.js'].lineData[436]++;
  d.tcols.val(selectedTable.one("tr") ? selectedTable.one("tr").children().length : 0);
  _$jscoverage['/dialog.js'].lineData[438]++;
  d.thead.set("value", head ? '1' : '');
}, 
  _realTableShow: function() {
  _$jscoverage['/dialog.js'].functionData[11]++;
  _$jscoverage['/dialog.js'].lineData[441]++;
  var self = this, prefixCls = self.editor.get('prefixCls'), d = self.dialog;
  _$jscoverage['/dialog.js'].lineData[445]++;
  if (visit47_445_1(self.selectedTable)) {
    _$jscoverage['/dialog.js'].lineData[446]++;
    self._fillTableDialog();
    _$jscoverage['/dialog.js'].lineData[449]++;
    d.get("el").all(replacePrefix(".{prefixCls}editor-table-create-only", prefixCls)).attr("disabled", "disabled");
    _$jscoverage['/dialog.js'].lineData[450]++;
    d.thead.set('disabled', true);
  } else {
    _$jscoverage['/dialog.js'].lineData[453]++;
    d.get("el").all(replacePrefix(".{prefixCls}editor-table-create-only", prefixCls)).removeAttr("disabled");
    _$jscoverage['/dialog.js'].lineData[454]++;
    d.thead.set('disabled', false);
  }
  _$jscoverage['/dialog.js'].lineData[456]++;
  if (visit48_456_1(self.selectedTd)) {
    _$jscoverage['/dialog.js'].lineData[457]++;
    d.cellpaddingHolder.show();
  } else {
    _$jscoverage['/dialog.js'].lineData[459]++;
    d.cellpaddingHolder.hide();
  }
  _$jscoverage['/dialog.js'].lineData[461]++;
  self.dialog.show();
}, 
  _prepareTableShow: function() {
  _$jscoverage['/dialog.js'].functionData[12]++;
  _$jscoverage['/dialog.js'].lineData[464]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[465]++;
  self._tableInit();
}, 
  show: function(cfg) {
  _$jscoverage['/dialog.js'].functionData[13]++;
  _$jscoverage['/dialog.js'].lineData[468]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[469]++;
  S.mix(self, cfg);
  _$jscoverage['/dialog.js'].lineData[470]++;
  self._prepareTableShow();
}, 
  destroy: function() {
  _$jscoverage['/dialog.js'].functionData[14]++;
  _$jscoverage['/dialog.js'].lineData[473]++;
  destroyRes.call(this);
}});
  _$jscoverage['/dialog.js'].lineData[477]++;
  return TableDialog;
}, {
  requires: ['editor', '../dialog', '../menubutton']});
