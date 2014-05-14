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
  _$jscoverage['/dialog.js'].lineData[6] = 0;
  _$jscoverage['/dialog.js'].lineData[8] = 0;
  _$jscoverage['/dialog.js'].lineData[9] = 0;
  _$jscoverage['/dialog.js'].lineData[10] = 0;
  _$jscoverage['/dialog.js'].lineData[11] = 0;
  _$jscoverage['/dialog.js'].lineData[12] = 0;
  _$jscoverage['/dialog.js'].lineData[13] = 0;
  _$jscoverage['/dialog.js'].lineData[159] = 0;
  _$jscoverage['/dialog.js'].lineData[160] = 0;
  _$jscoverage['/dialog.js'].lineData[165] = 0;
  _$jscoverage['/dialog.js'].lineData[166] = 0;
  _$jscoverage['/dialog.js'].lineData[169] = 0;
  _$jscoverage['/dialog.js'].lineData[170] = 0;
  _$jscoverage['/dialog.js'].lineData[171] = 0;
  _$jscoverage['/dialog.js'].lineData[172] = 0;
  _$jscoverage['/dialog.js'].lineData[175] = 0;
  _$jscoverage['/dialog.js'].lineData[177] = 0;
  _$jscoverage['/dialog.js'].lineData[188] = 0;
  _$jscoverage['/dialog.js'].lineData[189] = 0;
  _$jscoverage['/dialog.js'].lineData[190] = 0;
  _$jscoverage['/dialog.js'].lineData[191] = 0;
  _$jscoverage['/dialog.js'].lineData[192] = 0;
  _$jscoverage['/dialog.js'].lineData[200] = 0;
  _$jscoverage['/dialog.js'].lineData[201] = 0;
  _$jscoverage['/dialog.js'].lineData[202] = 0;
  _$jscoverage['/dialog.js'].lineData[210] = 0;
  _$jscoverage['/dialog.js'].lineData[211] = 0;
  _$jscoverage['/dialog.js'].lineData[212] = 0;
  _$jscoverage['/dialog.js'].lineData[213] = 0;
  _$jscoverage['/dialog.js'].lineData[215] = 0;
  _$jscoverage['/dialog.js'].lineData[223] = 0;
  _$jscoverage['/dialog.js'].lineData[224] = 0;
  _$jscoverage['/dialog.js'].lineData[226] = 0;
  _$jscoverage['/dialog.js'].lineData[227] = 0;
  _$jscoverage['/dialog.js'].lineData[228] = 0;
  _$jscoverage['/dialog.js'].lineData[230] = 0;
  _$jscoverage['/dialog.js'].lineData[233] = 0;
  _$jscoverage['/dialog.js'].lineData[234] = 0;
  _$jscoverage['/dialog.js'].lineData[238] = 0;
  _$jscoverage['/dialog.js'].lineData[239] = 0;
  _$jscoverage['/dialog.js'].lineData[240] = 0;
  _$jscoverage['/dialog.js'].lineData[246] = 0;
  _$jscoverage['/dialog.js'].lineData[247] = 0;
  _$jscoverage['/dialog.js'].lineData[250] = 0;
  _$jscoverage['/dialog.js'].lineData[251] = 0;
  _$jscoverage['/dialog.js'].lineData[252] = 0;
  _$jscoverage['/dialog.js'].lineData[254] = 0;
  _$jscoverage['/dialog.js'].lineData[255] = 0;
  _$jscoverage['/dialog.js'].lineData[256] = 0;
  _$jscoverage['/dialog.js'].lineData[257] = 0;
  _$jscoverage['/dialog.js'].lineData[259] = 0;
  _$jscoverage['/dialog.js'].lineData[264] = 0;
  _$jscoverage['/dialog.js'].lineData[271] = 0;
  _$jscoverage['/dialog.js'].lineData[272] = 0;
  _$jscoverage['/dialog.js'].lineData[275] = 0;
  _$jscoverage['/dialog.js'].lineData[278] = 0;
  _$jscoverage['/dialog.js'].lineData[279] = 0;
  _$jscoverage['/dialog.js'].lineData[281] = 0;
  _$jscoverage['/dialog.js'].lineData[283] = 0;
  _$jscoverage['/dialog.js'].lineData[284] = 0;
  _$jscoverage['/dialog.js'].lineData[286] = 0;
  _$jscoverage['/dialog.js'].lineData[289] = 0;
  _$jscoverage['/dialog.js'].lineData[290] = 0;
  _$jscoverage['/dialog.js'].lineData[294] = 0;
  _$jscoverage['/dialog.js'].lineData[296] = 0;
  _$jscoverage['/dialog.js'].lineData[297] = 0;
  _$jscoverage['/dialog.js'].lineData[301] = 0;
  _$jscoverage['/dialog.js'].lineData[304] = 0;
  _$jscoverage['/dialog.js'].lineData[305] = 0;
  _$jscoverage['/dialog.js'].lineData[307] = 0;
  _$jscoverage['/dialog.js'].lineData[310] = 0;
  _$jscoverage['/dialog.js'].lineData[311] = 0;
  _$jscoverage['/dialog.js'].lineData[312] = 0;
  _$jscoverage['/dialog.js'].lineData[314] = 0;
  _$jscoverage['/dialog.js'].lineData[315] = 0;
  _$jscoverage['/dialog.js'].lineData[316] = 0;
  _$jscoverage['/dialog.js'].lineData[317] = 0;
  _$jscoverage['/dialog.js'].lineData[322] = 0;
  _$jscoverage['/dialog.js'].lineData[323] = 0;
  _$jscoverage['/dialog.js'].lineData[327] = 0;
  _$jscoverage['/dialog.js'].lineData[328] = 0;
  _$jscoverage['/dialog.js'].lineData[333] = 0;
  _$jscoverage['/dialog.js'].lineData[344] = 0;
  _$jscoverage['/dialog.js'].lineData[345] = 0;
  _$jscoverage['/dialog.js'].lineData[348] = 0;
  _$jscoverage['/dialog.js'].lineData[349] = 0;
  _$jscoverage['/dialog.js'].lineData[352] = 0;
  _$jscoverage['/dialog.js'].lineData[355] = 0;
  _$jscoverage['/dialog.js'].lineData[356] = 0;
  _$jscoverage['/dialog.js'].lineData[359] = 0;
  _$jscoverage['/dialog.js'].lineData[360] = 0;
  _$jscoverage['/dialog.js'].lineData[363] = 0;
  _$jscoverage['/dialog.js'].lineData[364] = 0;
  _$jscoverage['/dialog.js'].lineData[367] = 0;
  _$jscoverage['/dialog.js'].lineData[369] = 0;
  _$jscoverage['/dialog.js'].lineData[370] = 0;
  _$jscoverage['/dialog.js'].lineData[373] = 0;
  _$jscoverage['/dialog.js'].lineData[374] = 0;
  _$jscoverage['/dialog.js'].lineData[376] = 0;
  _$jscoverage['/dialog.js'].lineData[377] = 0;
  _$jscoverage['/dialog.js'].lineData[380] = 0;
  _$jscoverage['/dialog.js'].lineData[381] = 0;
  _$jscoverage['/dialog.js'].lineData[382] = 0;
  _$jscoverage['/dialog.js'].lineData[384] = 0;
  _$jscoverage['/dialog.js'].lineData[385] = 0;
  _$jscoverage['/dialog.js'].lineData[386] = 0;
  _$jscoverage['/dialog.js'].lineData[387] = 0;
  _$jscoverage['/dialog.js'].lineData[388] = 0;
  _$jscoverage['/dialog.js'].lineData[390] = 0;
  _$jscoverage['/dialog.js'].lineData[391] = 0;
  _$jscoverage['/dialog.js'].lineData[392] = 0;
  _$jscoverage['/dialog.js'].lineData[395] = 0;
  _$jscoverage['/dialog.js'].lineData[396] = 0;
  _$jscoverage['/dialog.js'].lineData[397] = 0;
  _$jscoverage['/dialog.js'].lineData[398] = 0;
  _$jscoverage['/dialog.js'].lineData[399] = 0;
  _$jscoverage['/dialog.js'].lineData[401] = 0;
  _$jscoverage['/dialog.js'].lineData[403] = 0;
  _$jscoverage['/dialog.js'].lineData[404] = 0;
  _$jscoverage['/dialog.js'].lineData[406] = 0;
  _$jscoverage['/dialog.js'].lineData[407] = 0;
  _$jscoverage['/dialog.js'].lineData[410] = 0;
  _$jscoverage['/dialog.js'].lineData[414] = 0;
  _$jscoverage['/dialog.js'].lineData[415] = 0;
  _$jscoverage['/dialog.js'].lineData[419] = 0;
  _$jscoverage['/dialog.js'].lineData[422] = 0;
  _$jscoverage['/dialog.js'].lineData[424] = 0;
  _$jscoverage['/dialog.js'].lineData[427] = 0;
  _$jscoverage['/dialog.js'].lineData[430] = 0;
  _$jscoverage['/dialog.js'].lineData[431] = 0;
  _$jscoverage['/dialog.js'].lineData[432] = 0;
  _$jscoverage['/dialog.js'].lineData[434] = 0;
  _$jscoverage['/dialog.js'].lineData[437] = 0;
  _$jscoverage['/dialog.js'].lineData[439] = 0;
  _$jscoverage['/dialog.js'].lineData[440] = 0;
  _$jscoverage['/dialog.js'].lineData[441] = 0;
  _$jscoverage['/dialog.js'].lineData[443] = 0;
  _$jscoverage['/dialog.js'].lineData[444] = 0;
  _$jscoverage['/dialog.js'].lineData[447] = 0;
  _$jscoverage['/dialog.js'].lineData[448] = 0;
  _$jscoverage['/dialog.js'].lineData[450] = 0;
  _$jscoverage['/dialog.js'].lineData[453] = 0;
  _$jscoverage['/dialog.js'].lineData[457] = 0;
  _$jscoverage['/dialog.js'].lineData[458] = 0;
  _$jscoverage['/dialog.js'].lineData[461] = 0;
  _$jscoverage['/dialog.js'].lineData[462] = 0;
  _$jscoverage['/dialog.js'].lineData[465] = 0;
  _$jscoverage['/dialog.js'].lineData[466] = 0;
  _$jscoverage['/dialog.js'].lineData[468] = 0;
  _$jscoverage['/dialog.js'].lineData[469] = 0;
  _$jscoverage['/dialog.js'].lineData[471] = 0;
  _$jscoverage['/dialog.js'].lineData[473] = 0;
  _$jscoverage['/dialog.js'].lineData[476] = 0;
  _$jscoverage['/dialog.js'].lineData[477] = 0;
  _$jscoverage['/dialog.js'].lineData[480] = 0;
  _$jscoverage['/dialog.js'].lineData[481] = 0;
  _$jscoverage['/dialog.js'].lineData[482] = 0;
  _$jscoverage['/dialog.js'].lineData[485] = 0;
  _$jscoverage['/dialog.js'].lineData[489] = 0;
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
  _$jscoverage['/dialog.js'].branchData['12'] = [];
  _$jscoverage['/dialog.js'].branchData['12'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['166'] = [];
  _$jscoverage['/dialog.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['238'] = [];
  _$jscoverage['/dialog.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['241'] = [];
  _$jscoverage['/dialog.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['242'] = [];
  _$jscoverage['/dialog.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['242'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['243'] = [];
  _$jscoverage['/dialog.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['251'] = [];
  _$jscoverage['/dialog.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['256'] = [];
  _$jscoverage['/dialog.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['271'] = [];
  _$jscoverage['/dialog.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['278'] = [];
  _$jscoverage['/dialog.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['283'] = [];
  _$jscoverage['/dialog.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['283'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['289'] = [];
  _$jscoverage['/dialog.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['296'] = [];
  _$jscoverage['/dialog.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['304'] = [];
  _$jscoverage['/dialog.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['310'] = [];
  _$jscoverage['/dialog.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['311'] = [];
  _$jscoverage['/dialog.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['314'] = [];
  _$jscoverage['/dialog.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['316'] = [];
  _$jscoverage['/dialog.js'].branchData['316'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['327'] = [];
  _$jscoverage['/dialog.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['337'] = [];
  _$jscoverage['/dialog.js'].branchData['337'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['338'] = [];
  _$jscoverage['/dialog.js'].branchData['338'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['344'] = [];
  _$jscoverage['/dialog.js'].branchData['344'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['348'] = [];
  _$jscoverage['/dialog.js'].branchData['348'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['355'] = [];
  _$jscoverage['/dialog.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['359'] = [];
  _$jscoverage['/dialog.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['363'] = [];
  _$jscoverage['/dialog.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['369'] = [];
  _$jscoverage['/dialog.js'].branchData['369'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['369'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['373'] = [];
  _$jscoverage['/dialog.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['376'] = [];
  _$jscoverage['/dialog.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['381'] = [];
  _$jscoverage['/dialog.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['384'] = [];
  _$jscoverage['/dialog.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['387'] = [];
  _$jscoverage['/dialog.js'].branchData['387'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['396'] = [];
  _$jscoverage['/dialog.js'].branchData['396'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['398'] = [];
  _$jscoverage['/dialog.js'].branchData['398'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['414'] = [];
  _$jscoverage['/dialog.js'].branchData['414'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['416'] = [];
  _$jscoverage['/dialog.js'].branchData['416'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['419'] = [];
  _$jscoverage['/dialog.js'].branchData['419'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['422'] = [];
  _$jscoverage['/dialog.js'].branchData['422'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['424'] = [];
  _$jscoverage['/dialog.js'].branchData['424'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['431'] = [];
  _$jscoverage['/dialog.js'].branchData['431'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['437'] = [];
  _$jscoverage['/dialog.js'].branchData['437'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['440'] = [];
  _$jscoverage['/dialog.js'].branchData['440'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['457'] = [];
  _$jscoverage['/dialog.js'].branchData['457'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['468'] = [];
  _$jscoverage['/dialog.js'].branchData['468'][1] = new BranchData();
}
_$jscoverage['/dialog.js'].branchData['468'][1].init(676, 15, 'self.selectedTd');
function visit47_468_1(result) {
  _$jscoverage['/dialog.js'].branchData['468'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['457'][1].init(143, 18, 'self.selectedTable');
function visit46_457_1(result) {
  _$jscoverage['/dialog.js'].branchData['457'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['440'][1].init(1100, 7, 'caption');
function visit45_440_1(result) {
  _$jscoverage['/dialog.js'].branchData['440'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['437'][1].init(-1, 35, 'selectedTable.style(\'height\') || \'\'');
function visit44_437_1(result) {
  _$jscoverage['/dialog.js'].branchData['437'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['431'][1].init(789, 21, 'w.indexOf(\'%\') !== -1');
function visit43_431_1(result) {
  _$jscoverage['/dialog.js'].branchData['431'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['424'][1].init(516, 77, 'selectedTable.style(\'width\') || (\'\' + selectedTable.width())');
function visit42_424_1(result) {
  _$jscoverage['/dialog.js'].branchData['424'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['422'][1].init(440, 52, 'selectedTable.attr(\'border\') || \'0\'');
function visit41_422_1(result) {
  _$jscoverage['/dialog.js'].branchData['422'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['419'][1].init(373, 33, 'selectedTable.attr(\'align\') || \'\'');
function visit40_419_1(result) {
  _$jscoverage['/dialog.js'].branchData['419'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['416'][1].init(39, 50, 'parseInt(self.selectedTd.css(\'padding\'), 10) || \'0\'');
function visit39_416_1(result) {
  _$jscoverage['/dialog.js'].branchData['416'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['414'][1].init(192, 15, 'self.selectedTd');
function visit38_414_1(result) {
  _$jscoverage['/dialog.js'].branchData['414'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['398'][1].init(63, 8, 'i < cols');
function visit37_398_1(result) {
  _$jscoverage['/dialog.js'].branchData['398'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['396'][1].init(2137, 8, 'r < rows');
function visit36_396_1(result) {
  _$jscoverage['/dialog.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['387'][1].init(99, 8, 'i < cols');
function visit35_387_1(result) {
  _$jscoverage['/dialog.js'].branchData['387'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['384'][1].init(1745, 20, 'd.thead.get(\'value\')');
function visit34_384_1(result) {
  _$jscoverage['/dialog.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['381'][1].init(1578, 23, 'valid(d.tcaption.val())');
function visit33_381_1(result) {
  _$jscoverage['/dialog.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['376'][1].init(1437, 14, 'classes.length');
function visit32_376_1(result) {
  _$jscoverage['/dialog.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['373'][1].init(1328, 22, 'd.tcollapse[0].checked');
function visit31_373_1(result) {
  _$jscoverage['/dialog.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['369'][2].init(1201, 37, 'String(trim(d.tborder.val())) === \'0\'');
function visit30_369_2(result) {
  _$jscoverage['/dialog.js'].branchData['369'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['369'][1].init(1174, 64, '!valid(d.tborder.val()) || String(trim(d.tborder.val())) === \'0\'');
function visit29_369_1(result) {
  _$jscoverage['/dialog.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['363'][1].init(1029, 13, 'styles.length');
function visit28_363_1(result) {
  _$jscoverage['/dialog.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['359'][1].init(896, 22, 'valid(d.theight.val())');
function visit27_359_1(result) {
  _$jscoverage['/dialog.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['355'][1].init(740, 21, 'valid(d.twidth.val())');
function visit26_355_1(result) {
  _$jscoverage['/dialog.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['348'][1].init(578, 22, 'valid(d.tborder.val())');
function visit25_348_1(result) {
  _$jscoverage['/dialog.js'].branchData['348'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['344'][1].init(439, 28, 'valid(d.talign.get(\'value\'))');
function visit24_344_1(result) {
  _$jscoverage['/dialog.js'].branchData['344'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['338'][1].init(186, 31, 'parseInt(d.trows.val(), 10) || 1');
function visit23_338_1(result) {
  _$jscoverage['/dialog.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['337'][1].init(129, 31, 'parseInt(d.tcols.val(), 10) || 1');
function visit22_337_1(result) {
  _$jscoverage['/dialog.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['327'][1].init(2526, 7, 'caption');
function visit21_327_1(result) {
  _$jscoverage['/dialog.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['316'][1].init(90, 21, 'caption && caption[0]');
function visit20_316_1(result) {
  _$jscoverage['/dialog.js'].branchData['316'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['314'][1].init(1852, 23, 'valid(d.tcaption.val())');
function visit19_314_1(result) {
  _$jscoverage['/dialog.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['311'][1].init(1731, 15, 'self.selectedTd');
function visit18_311_1(result) {
  _$jscoverage['/dialog.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['310'][1].init(1674, 37, 'parseInt(d.cellpadding.val(), 10) || 0');
function visit17_310_1(result) {
  _$jscoverage['/dialog.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['304'][1].init(1431, 22, 'd.tcollapse[0].checked');
function visit16_304_1(result) {
  _$jscoverage['/dialog.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['296'][1].init(1196, 22, 'valid(d.theight.val())');
function visit15_296_1(result) {
  _$jscoverage['/dialog.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['289'][1].init(939, 21, 'valid(d.twidth.val())');
function visit14_289_1(result) {
  _$jscoverage['/dialog.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['283'][2].init(712, 18, 'tborderVal === \'0\'');
function visit13_283_2(result) {
  _$jscoverage['/dialog.js'].branchData['283'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['283'][1].init(690, 40, '!valid(tborderVal) || tborderVal === \'0\'');
function visit12_283_1(result) {
  _$jscoverage['/dialog.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['278'][1].init(497, 17, 'valid(tborderVal)');
function visit11_278_1(result) {
  _$jscoverage['/dialog.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['271'][1].init(293, 16, 'valid(talignVal)');
function visit10_271_1(result) {
  _$jscoverage['/dialog.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['256'][1].init(22, 19, '!self.selectedTable');
function visit9_256_1(result) {
  _$jscoverage['/dialog.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['251'][1].init(659, 3, '!re');
function visit8_251_1(result) {
  _$jscoverage['/dialog.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['243'][1].init(40, 6, 'tw < 0');
function visit7_243_1(result) {
  _$jscoverage['/dialog.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['242'][2].init(34, 8, 'tw > 100');
function visit6_242_2(result) {
  _$jscoverage['/dialog.js'].branchData['242'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['242'][1].init(-1, 47, 'tw > 100 || tw < 0');
function visit5_242_1(result) {
  _$jscoverage['/dialog.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['241'][1].init(25, 108, '!tw || (tw > 100 || tw < 0)');
function visit4_241_1(result) {
  _$jscoverage['/dialog.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['238'][1].init(180, 43, 'tableDialog.twidthunit.get(\'value\') === \'%\'');
function visit3_238_1(result) {
  _$jscoverage['/dialog.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['166'][1].init(17, 22, 'trim(str).length !== 0');
function visit2_166_1(result) {
  _$jscoverage['/dialog.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['12'][1].init(201, 25, 'require(\'ua\').ieMode < 11');
function visit1_12_1(result) {
  _$jscoverage['/dialog.js'].branchData['12'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/dialog.js'].functionData[0]++;
  _$jscoverage['/dialog.js'].lineData[8]++;
  var util = require('util');
  _$jscoverage['/dialog.js'].lineData[9]++;
  var Editor = require('editor');
  _$jscoverage['/dialog.js'].lineData[10]++;
  var Dialog4E = require('../dialog');
  _$jscoverage['/dialog.js'].lineData[11]++;
  var MenuButton = require('../menubutton');
  _$jscoverage['/dialog.js'].lineData[12]++;
  var OLD_IE = visit1_12_1(require('ua').ieMode < 11);
  _$jscoverage['/dialog.js'].lineData[13]++;
  var Node = require('node'), Dom = require('dom'), trim = util.trim, showBorderClassName = 'ke_show_border', collapseTableClass = 'k-e-collapse-table', IN_SIZE = 6, alignStyle = 'margin:0 5px 0 0;', TABLE_HTML = '<div style="padding:20px 20px 10px 20px;">' + '<table class="{prefixCls}editor-table-config" style="width:100%">' + '<tr>' + '<td>' + '<label>\u884c\u6570\uff1a ' + '<input ' + ' data-verify="^(?!0$)\\d+$" ' + ' data-warning="\u884c\u6570\u8bf7\u8f93\u5165\u6b63\u6574\u6570" ' + ' value="2" ' + ' class="{prefixCls}editor-table-rows {prefixCls}editor-table-create-only {prefixCls}editor-input" ' + 'style="' + alignStyle + '"' + ' size="' + IN_SIZE + '"' + ' />' + '</label>' + '</td>' + '<td>' + '<label>\u5bbd&nbsp;&nbsp;&nbsp;\u5ea6\uff1a ' + '</label> ' + '<input ' + ' data-verify="^(?!0$)\\d+$" ' + ' data-warning="\u5bbd\u5ea6\u8bf7\u8f93\u5165\u6b63\u6574\u6570" ' + 'value="200" ' + 'style="' + alignStyle + '" ' + 'class="{prefixCls}editor-table-width {prefixCls}editor-input" ' + 'size="' + IN_SIZE + '"/>' + '<select class="{prefixCls}editor-table-width-unit" title="\u5bbd\u5ea6\u5355\u4f4d">' + '<option value="px">\u50cf\u7d20</option>' + '<option value="%">\u767e\u5206\u6bd4</option>' + '</select>' + '</td>' + '</tr>' + '<tr>' + '<td>' + '<label>\u5217\u6570\uff1a ' + '<input ' + ' data-verify="^(?!0$)\\d+$" ' + ' data-warning="\u5217\u6570\u8bf7\u8f93\u5165\u6b63\u6574\u6570" ' + 'class="{prefixCls}editor-table-cols {prefixCls}editor-table-create-only {prefixCls}editor-input" ' + 'style="' + alignStyle + '"' + 'value="3" ' + 'size="' + IN_SIZE + '"/>' + '</label>' + '</td>' + '<td>' + '<label>' + '\u9ad8&nbsp;&nbsp;&nbsp;\u5ea6\uff1a ' + '</label>' + '<input ' + ' data-verify="^((?!0$)\\d+)?$" ' + ' data-warning="\u9ad8\u5ea6\u8bf7\u8f93\u5165\u6b63\u6574\u6570" ' + 'value="" ' + 'style="' + alignStyle + '"' + 'class="{prefixCls}editor-table-height {prefixCls}editor-input" ' + 'size="' + IN_SIZE + '"/>' + ' &nbsp;\u50cf\u7d20' + '</td>' + '</tr>' + '<tr>' + '<td>' + '<label>\u5bf9\u9f50\uff1a </label>' + '<select class="{prefixCls}editor-table-align" title="\u5bf9\u9f50">' + '<option value="">\u65e0</option>' + '<option value="left">\u5de6\u5bf9\u9f50</option>' + '<option value="right">\u53f3\u5bf9\u9f50</option>' + '<option value="center">\u4e2d\u95f4\u5bf9\u9f50</option>' + '</select>' + '</td>' + '<td>' + '<label>\u6807\u9898\u683c\uff1a</label> ' + '<select class="{prefixCls}editor-table-head {prefixCls}editor-table-create-only" title="\u6807\u9898\u683c">' + '<option value="">\u65e0</option>' + '<option value="1">\u6709</option>' + '</select>' + '</td>' + '</tr>' + '<tr>' + '<td>' + '<label>\u8fb9\u6846\uff1a ' + '<input ' + ' data-verify="^\\d+$" ' + ' data-warning="\u8fb9\u6846\u8bf7\u8f93\u5165\u975e\u8d1f\u6574\u6570" ' + 'value="1" ' + 'style="' + alignStyle + '"' + 'class="{prefixCls}editor-table-border {prefixCls}editor-input" ' + 'size="' + IN_SIZE + '"/>' + '</label> &nbsp;\u50cf\u7d20' + ' ' + '<label><input ' + 'type="checkbox" ' + 'style="vertical-align: middle; margin-left: 5px;" ' + 'class="{prefixCls}editor-table-collapse" ' + '/> \u5408\u5e76\u8fb9\u6846' + '</label>' + '</td>' + '<td>' + '<label ' + 'class="{prefixCls}editor-table-cellpadding-holder"' + '>\u8fb9&nbsp;&nbsp;&nbsp;\u8ddd\uff1a ' + '<input ' + ' data-verify="^(\\d+)?$" ' + ' data-warning="\u8fb9\u6846\u8bf7\u8f93\u5165\u975e\u8d1f\u6574\u6570" ' + 'value="0" ' + 'style="' + alignStyle + '"' + 'class="{prefixCls}editor-table-cellpadding {prefixCls}editor-input" ' + 'size="' + IN_SIZE + '"/>' + ' &nbsp;\u50cf\u7d20</label>' + '</td>' + '</tr>' + '<tr>' + '<td colspan="2">' + '<label>' + '\u6807\u9898\uff1a ' + '<input ' + 'class="{prefixCls}editor-table-caption {prefixCls}editor-input" ' + 'style="width:380px;' + alignStyle + '">' + '</label>' + '</td>' + '</tr>' + '</table>' + '</div>', footHTML = '<div style="padding:5px 20px 20px;">' + '<a ' + 'class="{prefixCls}editor-table-ok {prefixCls}editor-button ks-inline-block" ' + 'style="margin-right:20px;">\u786e\u5b9a</a> ' + '<a ' + 'class="{prefixCls}editor-table-cancel {prefixCls}editor-button ks-inline-block">\u53d6\u6d88</a>' + '</div>', addRes = Editor.Utils.addRes, destroyRes = Editor.Utils.destroyRes;
  _$jscoverage['/dialog.js'].lineData[159]++;
  function replacePrefix(str, prefix) {
    _$jscoverage['/dialog.js'].functionData[1]++;
    _$jscoverage['/dialog.js'].lineData[160]++;
    return util.substitute(str, {
  prefixCls: prefix});
  }
  _$jscoverage['/dialog.js'].lineData[165]++;
  function valid(str) {
    _$jscoverage['/dialog.js'].functionData[2]++;
    _$jscoverage['/dialog.js'].lineData[166]++;
    return visit2_166_1(trim(str).length !== 0);
  }
  _$jscoverage['/dialog.js'].lineData[169]++;
  function TableDialog(editor) {
    _$jscoverage['/dialog.js'].functionData[3]++;
    _$jscoverage['/dialog.js'].lineData[170]++;
    var self = this;
    _$jscoverage['/dialog.js'].lineData[171]++;
    self.editor = editor;
    _$jscoverage['/dialog.js'].lineData[172]++;
    Editor.Utils.lazyRun(self, '_prepareTableShow', '_realTableShow');
  }
  _$jscoverage['/dialog.js'].lineData[175]++;
  util.augment(TableDialog, {
  _tableInit: function() {
  _$jscoverage['/dialog.js'].functionData[4]++;
  _$jscoverage['/dialog.js'].lineData[177]++;
  var self = this, prefixCls = self.editor.get('prefixCls'), d = new Dialog4E({
  width: '500px', 
  mask: true, 
  headerContent: '\u8868\u683c', 
  bodyContent: replacePrefix(TABLE_HTML, prefixCls), 
  footerContent: replacePrefix(footHTML, prefixCls)}).render(), dbody = d.get('body'), foot = d.get('footer');
  _$jscoverage['/dialog.js'].lineData[188]++;
  d.twidth = dbody.one(replacePrefix('.{prefixCls}editor-table-width', prefixCls));
  _$jscoverage['/dialog.js'].lineData[189]++;
  d.theight = dbody.one(replacePrefix('.{prefixCls}editor-table-height', prefixCls));
  _$jscoverage['/dialog.js'].lineData[190]++;
  d.tborder = dbody.one(replacePrefix('.{prefixCls}editor-table-border', prefixCls));
  _$jscoverage['/dialog.js'].lineData[191]++;
  d.tcaption = dbody.one(replacePrefix('.{prefixCls}editor-table-caption', prefixCls));
  _$jscoverage['/dialog.js'].lineData[192]++;
  d.talign = MenuButton.Select.decorate(dbody.one(replacePrefix('.{prefixCls}editor-table-align', prefixCls)), {
  prefixCls: replacePrefix('{prefixCls}editor-big-', prefixCls), 
  width: 80, 
  menuCfg: {
  prefixCls: replacePrefix('{prefixCls}editor-', prefixCls), 
  render: dbody}});
  _$jscoverage['/dialog.js'].lineData[200]++;
  d.trows = dbody.one(replacePrefix('.{prefixCls}editor-table-rows', prefixCls));
  _$jscoverage['/dialog.js'].lineData[201]++;
  d.tcols = dbody.one(replacePrefix('.{prefixCls}editor-table-cols', prefixCls));
  _$jscoverage['/dialog.js'].lineData[202]++;
  d.thead = MenuButton.Select.decorate(dbody.one(replacePrefix('.{prefixCls}editor-table-head', prefixCls)), {
  prefixCls: replacePrefix('{prefixCls}editor-big-', prefixCls), 
  width: 80, 
  menuCfg: {
  prefixCls: replacePrefix('{prefixCls}editor-', prefixCls), 
  render: dbody}});
  _$jscoverage['/dialog.js'].lineData[210]++;
  d.cellpaddingHolder = dbody.one(replacePrefix('.{prefixCls}editor-table-cellpadding-holder', prefixCls));
  _$jscoverage['/dialog.js'].lineData[211]++;
  d.cellpadding = dbody.one(replacePrefix('.{prefixCls}editor-table-cellpadding', prefixCls));
  _$jscoverage['/dialog.js'].lineData[212]++;
  d.tcollapse = dbody.one(replacePrefix('.{prefixCls}editor-table-collapse', prefixCls));
  _$jscoverage['/dialog.js'].lineData[213]++;
  var tok = foot.one(replacePrefix('.{prefixCls}editor-table-ok', prefixCls)), tclose = foot.one(replacePrefix('.{prefixCls}editor-table-cancel', prefixCls));
  _$jscoverage['/dialog.js'].lineData[215]++;
  d.twidthunit = MenuButton.Select.decorate(dbody.one(replacePrefix('.{prefixCls}editor-table-width-unit', prefixCls)), {
  prefixCls: replacePrefix('{prefixCls}editor-big-', prefixCls), 
  width: 80, 
  menuCfg: {
  prefixCls: replacePrefix('{prefixCls}editor-', prefixCls), 
  render: dbody}});
  _$jscoverage['/dialog.js'].lineData[223]++;
  self.dialog = d;
  _$jscoverage['/dialog.js'].lineData[224]++;
  tok.on('click', self._tableOk, self);
  _$jscoverage['/dialog.js'].lineData[226]++;
  tclose.on('click', function(ev) {
  _$jscoverage['/dialog.js'].functionData[5]++;
  _$jscoverage['/dialog.js'].lineData[227]++;
  ev.halt();
  _$jscoverage['/dialog.js'].lineData[228]++;
  d.hide();
});
  _$jscoverage['/dialog.js'].lineData[230]++;
  addRes.call(self, d, d.twidthunit, tok, tclose);
}, 
  _tableOk: function(ev) {
  _$jscoverage['/dialog.js'].functionData[6]++;
  _$jscoverage['/dialog.js'].lineData[233]++;
  ev.halt();
  _$jscoverage['/dialog.js'].lineData[234]++;
  var self = this, tableDialog = self.dialog, inputs = tableDialog.get('el').all('input');
  _$jscoverage['/dialog.js'].lineData[238]++;
  if (visit3_238_1(tableDialog.twidthunit.get('value') === '%')) {
    _$jscoverage['/dialog.js'].lineData[239]++;
    var tw = parseInt(tableDialog.twidth.val(), 10);
    _$jscoverage['/dialog.js'].lineData[240]++;
    if (visit4_241_1(!tw || (visit5_242_1(visit6_242_2(tw > 100) || visit7_243_1(tw < 0))))) {
      _$jscoverage['/dialog.js'].lineData[246]++;
      alert('\u5bbd\u5ea6\u767e\u5206\u6bd4\uff1a' + '\u8bf7\u8f93\u51651-100\u4e4b\u95f4');
      _$jscoverage['/dialog.js'].lineData[247]++;
      return;
    }
  }
  _$jscoverage['/dialog.js'].lineData[250]++;
  var re = Editor.Utils.verifyInputs(inputs);
  _$jscoverage['/dialog.js'].lineData[251]++;
  if (visit8_251_1(!re)) {
    _$jscoverage['/dialog.js'].lineData[252]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[254]++;
  self.dialog.hide();
  _$jscoverage['/dialog.js'].lineData[255]++;
  setTimeout(function() {
  _$jscoverage['/dialog.js'].functionData[7]++;
  _$jscoverage['/dialog.js'].lineData[256]++;
  if (visit9_256_1(!self.selectedTable)) {
    _$jscoverage['/dialog.js'].lineData[257]++;
    self._genTable();
  } else {
    _$jscoverage['/dialog.js'].lineData[259]++;
    self._modifyTable();
  }
}, 0);
}, 
  _modifyTable: function() {
  _$jscoverage['/dialog.js'].functionData[8]++;
  _$jscoverage['/dialog.js'].lineData[264]++;
  var self = this, d = self.dialog, selectedTable = self.selectedTable, caption = selectedTable.one('caption'), talignVal = d.talign.get('value'), tborderVal = d.tborder.val();
  _$jscoverage['/dialog.js'].lineData[271]++;
  if (visit10_271_1(valid(talignVal))) {
    _$jscoverage['/dialog.js'].lineData[272]++;
    selectedTable.attr('align', trim(talignVal));
  } else {
    _$jscoverage['/dialog.js'].lineData[275]++;
    selectedTable.removeAttr('align');
  }
  _$jscoverage['/dialog.js'].lineData[278]++;
  if (visit11_278_1(valid(tborderVal))) {
    _$jscoverage['/dialog.js'].lineData[279]++;
    selectedTable.attr('border', trim(tborderVal));
  } else {
    _$jscoverage['/dialog.js'].lineData[281]++;
    selectedTable.removeAttr('border');
  }
  _$jscoverage['/dialog.js'].lineData[283]++;
  if (visit12_283_1(!valid(tborderVal) || visit13_283_2(tborderVal === '0'))) {
    _$jscoverage['/dialog.js'].lineData[284]++;
    selectedTable.addClass(showBorderClassName, undefined);
  } else {
    _$jscoverage['/dialog.js'].lineData[286]++;
    selectedTable.removeClass(showBorderClassName, undefined);
  }
  _$jscoverage['/dialog.js'].lineData[289]++;
  if (visit14_289_1(valid(d.twidth.val()))) {
    _$jscoverage['/dialog.js'].lineData[290]++;
    selectedTable.css('width', trim(d.twidth.val()) + d.twidthunit.get('value'));
  } else {
    _$jscoverage['/dialog.js'].lineData[294]++;
    selectedTable.css('width', '');
  }
  _$jscoverage['/dialog.js'].lineData[296]++;
  if (visit15_296_1(valid(d.theight.val()))) {
    _$jscoverage['/dialog.js'].lineData[297]++;
    selectedTable.css('height', trim(d.theight.val()));
  } else {
    _$jscoverage['/dialog.js'].lineData[301]++;
    selectedTable.css('height', '');
  }
  _$jscoverage['/dialog.js'].lineData[304]++;
  if (visit16_304_1(d.tcollapse[0].checked)) {
    _$jscoverage['/dialog.js'].lineData[305]++;
    selectedTable.addClass(collapseTableClass, undefined);
  } else {
    _$jscoverage['/dialog.js'].lineData[307]++;
    selectedTable.removeClass(collapseTableClass, undefined);
  }
  _$jscoverage['/dialog.js'].lineData[310]++;
  d.cellpadding.val(visit17_310_1(parseInt(d.cellpadding.val(), 10) || 0));
  _$jscoverage['/dialog.js'].lineData[311]++;
  if (visit18_311_1(self.selectedTd)) {
    _$jscoverage['/dialog.js'].lineData[312]++;
    self.selectedTd.css('padding', d.cellpadding.val());
  }
  _$jscoverage['/dialog.js'].lineData[314]++;
  if (visit19_314_1(valid(d.tcaption.val()))) {
    _$jscoverage['/dialog.js'].lineData[315]++;
    var tcv = util.escapeHtml(trim(d.tcaption.val()));
    _$jscoverage['/dialog.js'].lineData[316]++;
    if (visit20_316_1(caption && caption[0])) {
      _$jscoverage['/dialog.js'].lineData[317]++;
      caption.html(tcv);
    } else {
      _$jscoverage['/dialog.js'].lineData[322]++;
      var c = selectedTable[0].createCaption();
      _$jscoverage['/dialog.js'].lineData[323]++;
      Dom.html(c, '<span>' + tcv + '</span>');
    }
  } else {
    _$jscoverage['/dialog.js'].lineData[327]++;
    if (visit21_327_1(caption)) {
      _$jscoverage['/dialog.js'].lineData[328]++;
      caption.remove();
    }
  }
}, 
  _genTable: function() {
  _$jscoverage['/dialog.js'].functionData[9]++;
  _$jscoverage['/dialog.js'].lineData[333]++;
  var self = this, d = self.dialog, html = '<table ', i, cols = visit22_337_1(parseInt(d.tcols.val(), 10) || 1), rows = visit23_338_1(parseInt(d.trows.val(), 10) || 1), cellPad = OLD_IE ? '' : '<br/>', editor = self.editor;
  _$jscoverage['/dialog.js'].lineData[344]++;
  if (visit24_344_1(valid(d.talign.get('value')))) {
    _$jscoverage['/dialog.js'].lineData[345]++;
    html += 'align="' + trim(d.talign.get('value')) + '" ';
  }
  _$jscoverage['/dialog.js'].lineData[348]++;
  if (visit25_348_1(valid(d.tborder.val()))) {
    _$jscoverage['/dialog.js'].lineData[349]++;
    html += 'border="' + trim(d.tborder.val()) + '" ';
  }
  _$jscoverage['/dialog.js'].lineData[352]++;
  var styles = [];
  _$jscoverage['/dialog.js'].lineData[355]++;
  if (visit26_355_1(valid(d.twidth.val()))) {
    _$jscoverage['/dialog.js'].lineData[356]++;
    styles.push('width:' + trim(d.twidth.val()) + d.twidthunit.get('value') + ';');
  }
  _$jscoverage['/dialog.js'].lineData[359]++;
  if (visit27_359_1(valid(d.theight.val()))) {
    _$jscoverage['/dialog.js'].lineData[360]++;
    styles.push('height:' + trim(d.theight.val()) + 'px;');
  }
  _$jscoverage['/dialog.js'].lineData[363]++;
  if (visit28_363_1(styles.length)) {
    _$jscoverage['/dialog.js'].lineData[364]++;
    html += 'style="' + styles.join('') + '" ';
  }
  _$jscoverage['/dialog.js'].lineData[367]++;
  var classes = [];
  _$jscoverage['/dialog.js'].lineData[369]++;
  if (visit29_369_1(!valid(d.tborder.val()) || visit30_369_2(String(trim(d.tborder.val())) === '0'))) {
    _$jscoverage['/dialog.js'].lineData[370]++;
    classes.push(showBorderClassName);
  }
  _$jscoverage['/dialog.js'].lineData[373]++;
  if (visit31_373_1(d.tcollapse[0].checked)) {
    _$jscoverage['/dialog.js'].lineData[374]++;
    classes.push(collapseTableClass);
  }
  _$jscoverage['/dialog.js'].lineData[376]++;
  if (visit32_376_1(classes.length)) {
    _$jscoverage['/dialog.js'].lineData[377]++;
    html += 'class="' + classes.join(' ') + '" ';
  }
  _$jscoverage['/dialog.js'].lineData[380]++;
  html += '>';
  _$jscoverage['/dialog.js'].lineData[381]++;
  if (visit33_381_1(valid(d.tcaption.val()))) {
    _$jscoverage['/dialog.js'].lineData[382]++;
    html += '<caption><span>' + util.escapeHtml(trim(d.tcaption.val())) + '</span></caption>';
  }
  _$jscoverage['/dialog.js'].lineData[384]++;
  if (visit34_384_1(d.thead.get('value'))) {
    _$jscoverage['/dialog.js'].lineData[385]++;
    html += '<thead>';
    _$jscoverage['/dialog.js'].lineData[386]++;
    html += '<tr>';
    _$jscoverage['/dialog.js'].lineData[387]++;
    for (i = 0; visit35_387_1(i < cols); i++) {
      _$jscoverage['/dialog.js'].lineData[388]++;
      html += '<th>' + cellPad + '</th>';
    }
    _$jscoverage['/dialog.js'].lineData[390]++;
    html += '</tr>';
    _$jscoverage['/dialog.js'].lineData[391]++;
    html += '</thead>';
    _$jscoverage['/dialog.js'].lineData[392]++;
    rows -= 1;
  }
  _$jscoverage['/dialog.js'].lineData[395]++;
  html += '<tbody>';
  _$jscoverage['/dialog.js'].lineData[396]++;
  for (var r = 0; visit36_396_1(r < rows); r++) {
    _$jscoverage['/dialog.js'].lineData[397]++;
    html += '<tr>';
    _$jscoverage['/dialog.js'].lineData[398]++;
    for (i = 0; visit37_398_1(i < cols); i++) {
      _$jscoverage['/dialog.js'].lineData[399]++;
      html += '<td>' + cellPad + '</td>';
    }
    _$jscoverage['/dialog.js'].lineData[401]++;
    html += '</tr>';
  }
  _$jscoverage['/dialog.js'].lineData[403]++;
  html += '</tbody>';
  _$jscoverage['/dialog.js'].lineData[404]++;
  html += '</table>';
  _$jscoverage['/dialog.js'].lineData[406]++;
  var table = new Node(html, null, editor.get('document')[0]);
  _$jscoverage['/dialog.js'].lineData[407]++;
  editor.insertElement(table);
}, 
  _fillTableDialog: function() {
  _$jscoverage['/dialog.js'].functionData[10]++;
  _$jscoverage['/dialog.js'].lineData[410]++;
  var self = this, d = self.dialog, selectedTable = self.selectedTable, caption = selectedTable.one('caption');
  _$jscoverage['/dialog.js'].lineData[414]++;
  if (visit38_414_1(self.selectedTd)) {
    _$jscoverage['/dialog.js'].lineData[415]++;
    d.cellpadding.val(visit39_416_1(parseInt(self.selectedTd.css('padding'), 10) || '0'));
  }
  _$jscoverage['/dialog.js'].lineData[419]++;
  d.talign.set('value', visit40_419_1(selectedTable.attr('align') || ''));
  _$jscoverage['/dialog.js'].lineData[422]++;
  d.tborder.val(visit41_422_1(selectedTable.attr('border') || '0'));
  _$jscoverage['/dialog.js'].lineData[424]++;
  var w = visit42_424_1(selectedTable.style('width') || ('' + selectedTable.width()));
  _$jscoverage['/dialog.js'].lineData[427]++;
  d.tcollapse[0].checked = selectedTable.hasClass(collapseTableClass, undefined);
  _$jscoverage['/dialog.js'].lineData[430]++;
  d.twidth.val(w.replace(/px|%|(.*pt)/i, ''));
  _$jscoverage['/dialog.js'].lineData[431]++;
  if (visit43_431_1(w.indexOf('%') !== -1)) {
    _$jscoverage['/dialog.js'].lineData[432]++;
    d.twidthunit.set('value', '%');
  } else {
    _$jscoverage['/dialog.js'].lineData[434]++;
    d.twidthunit.set('value', 'px');
  }
  _$jscoverage['/dialog.js'].lineData[437]++;
  d.theight.val((visit44_437_1(selectedTable.style('height') || '')).replace(/px|%/i, ''));
  _$jscoverage['/dialog.js'].lineData[439]++;
  var c = '';
  _$jscoverage['/dialog.js'].lineData[440]++;
  if (visit45_440_1(caption)) {
    _$jscoverage['/dialog.js'].lineData[441]++;
    c = caption.text();
  }
  _$jscoverage['/dialog.js'].lineData[443]++;
  d.tcaption.val(c);
  _$jscoverage['/dialog.js'].lineData[444]++;
  var head = selectedTable.first('thead'), rowLength = (selectedTable.one('tbody') ? selectedTable.one('tbody').children().length : 0) + (head ? head.children('tr').length : 0);
  _$jscoverage['/dialog.js'].lineData[447]++;
  d.trows.val(rowLength);
  _$jscoverage['/dialog.js'].lineData[448]++;
  d.tcols.val(selectedTable.one('tr') ? selectedTable.one('tr').children().length : 0);
  _$jscoverage['/dialog.js'].lineData[450]++;
  d.thead.set('value', head ? '1' : '');
}, 
  _realTableShow: function() {
  _$jscoverage['/dialog.js'].functionData[11]++;
  _$jscoverage['/dialog.js'].lineData[453]++;
  var self = this, prefixCls = self.editor.get('prefixCls'), d = self.dialog;
  _$jscoverage['/dialog.js'].lineData[457]++;
  if (visit46_457_1(self.selectedTable)) {
    _$jscoverage['/dialog.js'].lineData[458]++;
    self._fillTableDialog();
    _$jscoverage['/dialog.js'].lineData[461]++;
    d.get('el').all(replacePrefix('.{prefixCls}editor-table-create-only', prefixCls)).attr('disabled', 'disabled');
    _$jscoverage['/dialog.js'].lineData[462]++;
    d.thead.set('disabled', true);
  } else {
    _$jscoverage['/dialog.js'].lineData[465]++;
    d.get('el').all(replacePrefix('.{prefixCls}editor-table-create-only', prefixCls)).removeAttr('disabled');
    _$jscoverage['/dialog.js'].lineData[466]++;
    d.thead.set('disabled', false);
  }
  _$jscoverage['/dialog.js'].lineData[468]++;
  if (visit47_468_1(self.selectedTd)) {
    _$jscoverage['/dialog.js'].lineData[469]++;
    d.cellpaddingHolder.show();
  } else {
    _$jscoverage['/dialog.js'].lineData[471]++;
    d.cellpaddingHolder.hide();
  }
  _$jscoverage['/dialog.js'].lineData[473]++;
  self.dialog.show();
}, 
  _prepareTableShow: function() {
  _$jscoverage['/dialog.js'].functionData[12]++;
  _$jscoverage['/dialog.js'].lineData[476]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[477]++;
  self._tableInit();
}, 
  show: function(cfg) {
  _$jscoverage['/dialog.js'].functionData[13]++;
  _$jscoverage['/dialog.js'].lineData[480]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[481]++;
  util.mix(self, cfg);
  _$jscoverage['/dialog.js'].lineData[482]++;
  self._prepareTableShow();
}, 
  destroy: function() {
  _$jscoverage['/dialog.js'].functionData[14]++;
  _$jscoverage['/dialog.js'].lineData[485]++;
  destroyRes.call(this);
}});
  _$jscoverage['/dialog.js'].lineData[489]++;
  return TableDialog;
});
