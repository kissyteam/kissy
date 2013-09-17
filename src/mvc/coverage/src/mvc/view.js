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
if (! _$jscoverage['/mvc/view.js']) {
  _$jscoverage['/mvc/view.js'] = {};
  _$jscoverage['/mvc/view.js'].lineData = [];
  _$jscoverage['/mvc/view.js'].lineData[6] = 0;
  _$jscoverage['/mvc/view.js'].lineData[8] = 0;
  _$jscoverage['/mvc/view.js'].lineData[10] = 0;
  _$jscoverage['/mvc/view.js'].lineData[11] = 0;
  _$jscoverage['/mvc/view.js'].lineData[12] = 0;
  _$jscoverage['/mvc/view.js'].lineData[14] = 0;
  _$jscoverage['/mvc/view.js'].lineData[22] = 0;
  _$jscoverage['/mvc/view.js'].lineData[24] = 0;
  _$jscoverage['/mvc/view.js'].lineData[25] = 0;
  _$jscoverage['/mvc/view.js'].lineData[26] = 0;
  _$jscoverage['/mvc/view.js'].lineData[33] = 0;
  _$jscoverage['/mvc/view.js'].lineData[34] = 0;
  _$jscoverage['/mvc/view.js'].lineData[35] = 0;
  _$jscoverage['/mvc/view.js'].lineData[37] = 0;
  _$jscoverage['/mvc/view.js'].lineData[41] = 0;
  _$jscoverage['/mvc/view.js'].lineData[42] = 0;
  _$jscoverage['/mvc/view.js'].lineData[43] = 0;
  _$jscoverage['/mvc/view.js'].lineData[44] = 0;
  _$jscoverage['/mvc/view.js'].lineData[45] = 0;
  _$jscoverage['/mvc/view.js'].lineData[46] = 0;
  _$jscoverage['/mvc/view.js'].lineData[52] = 0;
  _$jscoverage['/mvc/view.js'].lineData[53] = 0;
  _$jscoverage['/mvc/view.js'].lineData[54] = 0;
  _$jscoverage['/mvc/view.js'].lineData[55] = 0;
  _$jscoverage['/mvc/view.js'].lineData[56] = 0;
  _$jscoverage['/mvc/view.js'].lineData[57] = 0;
  _$jscoverage['/mvc/view.js'].lineData[66] = 0;
  _$jscoverage['/mvc/view.js'].lineData[73] = 0;
  _$jscoverage['/mvc/view.js'].lineData[91] = 0;
  _$jscoverage['/mvc/view.js'].lineData[92] = 0;
  _$jscoverage['/mvc/view.js'].lineData[93] = 0;
  _$jscoverage['/mvc/view.js'].lineData[95] = 0;
}
if (! _$jscoverage['/mvc/view.js'].functionData) {
  _$jscoverage['/mvc/view.js'].functionData = [];
  _$jscoverage['/mvc/view.js'].functionData[0] = 0;
  _$jscoverage['/mvc/view.js'].functionData[1] = 0;
  _$jscoverage['/mvc/view.js'].functionData[2] = 0;
  _$jscoverage['/mvc/view.js'].functionData[3] = 0;
  _$jscoverage['/mvc/view.js'].functionData[4] = 0;
  _$jscoverage['/mvc/view.js'].functionData[5] = 0;
  _$jscoverage['/mvc/view.js'].functionData[6] = 0;
  _$jscoverage['/mvc/view.js'].functionData[7] = 0;
  _$jscoverage['/mvc/view.js'].functionData[8] = 0;
}
if (! _$jscoverage['/mvc/view.js'].branchData) {
  _$jscoverage['/mvc/view.js'].branchData = {};
  _$jscoverage['/mvc/view.js'].branchData['11'] = [];
  _$jscoverage['/mvc/view.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/mvc/view.js'].branchData['25'] = [];
  _$jscoverage['/mvc/view.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/mvc/view.js'].branchData['34'] = [];
  _$jscoverage['/mvc/view.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/mvc/view.js'].branchData['91'] = [];
  _$jscoverage['/mvc/view.js'].branchData['91'][1] = new BranchData();
}
_$jscoverage['/mvc/view.js'].branchData['91'][1].init(26, 20, 'typeof s == \'string\'');
function visit109_91_1(result) {
  _$jscoverage['/mvc/view.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/view.js'].branchData['34'][1].init(56, 7, 'prevVal');
function visit108_34_1(result) {
  _$jscoverage['/mvc/view.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/view.js'].branchData['25'][1].init(43, 27, 'events = this.get("events")');
function visit107_25_1(result) {
  _$jscoverage['/mvc/view.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/view.js'].branchData['11'][1].init(14, 20, 'typeof f == \'string\'');
function visit106_11_1(result) {
  _$jscoverage['/mvc/view.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/view.js'].lineData[6]++;
KISSY.add("mvc/view", function(S, Node, Base) {
  _$jscoverage['/mvc/view.js'].functionData[0]++;
  _$jscoverage['/mvc/view.js'].lineData[8]++;
  var $ = Node.all;
  _$jscoverage['/mvc/view.js'].lineData[10]++;
  function normFn(self, f) {
    _$jscoverage['/mvc/view.js'].functionData[1]++;
    _$jscoverage['/mvc/view.js'].lineData[11]++;
    if (visit106_11_1(typeof f == 'string')) {
      _$jscoverage['/mvc/view.js'].lineData[12]++;
      return self[f];
    }
    _$jscoverage['/mvc/view.js'].lineData[14]++;
    return f;
  }
  _$jscoverage['/mvc/view.js'].lineData[22]++;
  return Base.extend({
  initializer: function() {
  _$jscoverage['/mvc/view.js'].functionData[2]++;
  _$jscoverage['/mvc/view.js'].lineData[24]++;
  var events;
  _$jscoverage['/mvc/view.js'].lineData[25]++;
  if (visit107_25_1(events = this.get("events"))) {
    _$jscoverage['/mvc/view.js'].lineData[26]++;
    this._afterEventsChange({
  newVal: events});
  }
}, 
  _afterEventsChange: function(e) {
  _$jscoverage['/mvc/view.js'].functionData[3]++;
  _$jscoverage['/mvc/view.js'].lineData[33]++;
  var prevVal = e.prevVal;
  _$jscoverage['/mvc/view.js'].lineData[34]++;
  if (visit108_34_1(prevVal)) {
    _$jscoverage['/mvc/view.js'].lineData[35]++;
    this._removeEvents(prevVal);
  }
  _$jscoverage['/mvc/view.js'].lineData[37]++;
  this._addEvents(e.newVal);
}, 
  _removeEvents: function(events) {
  _$jscoverage['/mvc/view.js'].functionData[4]++;
  _$jscoverage['/mvc/view.js'].lineData[41]++;
  var el = this.get("el");
  _$jscoverage['/mvc/view.js'].lineData[42]++;
  for (var selector in events) {
    _$jscoverage['/mvc/view.js'].lineData[43]++;
    var event = events[selector];
    _$jscoverage['/mvc/view.js'].lineData[44]++;
    for (var type in event) {
      _$jscoverage['/mvc/view.js'].lineData[45]++;
      var callback = normFn(this, event[type]);
      _$jscoverage['/mvc/view.js'].lineData[46]++;
      el.undelegate(type, selector, callback, this);
    }
  }
}, 
  _addEvents: function(events) {
  _$jscoverage['/mvc/view.js'].functionData[5]++;
  _$jscoverage['/mvc/view.js'].lineData[52]++;
  var el = this.get("el");
  _$jscoverage['/mvc/view.js'].lineData[53]++;
  for (var selector in events) {
    _$jscoverage['/mvc/view.js'].lineData[54]++;
    var event = events[selector];
    _$jscoverage['/mvc/view.js'].lineData[55]++;
    for (var type in event) {
      _$jscoverage['/mvc/view.js'].lineData[56]++;
      var callback = normFn(this, event[type]);
      _$jscoverage['/mvc/view.js'].lineData[57]++;
      el.delegate(type, selector, callback, this);
    }
  }
}, 
  render: function() {
  _$jscoverage['/mvc/view.js'].functionData[6]++;
  _$jscoverage['/mvc/view.js'].lineData[66]++;
  return this;
}, 
  destroy: function() {
  _$jscoverage['/mvc/view.js'].functionData[7]++;
  _$jscoverage['/mvc/view.js'].lineData[73]++;
  this.get("el").remove();
}}, {
  ATTRS: {
  el: {
  value: "<div />", 
  getter: function(s) {
  _$jscoverage['/mvc/view.js'].functionData[8]++;
  _$jscoverage['/mvc/view.js'].lineData[91]++;
  if (visit109_91_1(typeof s == 'string')) {
    _$jscoverage['/mvc/view.js'].lineData[92]++;
    s = $(s);
    _$jscoverage['/mvc/view.js'].lineData[93]++;
    this.setInternal("el", s);
  }
  _$jscoverage['/mvc/view.js'].lineData[95]++;
  return s;
}}, 
  events: {}}});
}, {
  requires: ['node', 'base']});
