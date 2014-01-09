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
if (! _$jscoverage['/navigation-view/controller.js']) {
  _$jscoverage['/navigation-view/controller.js'] = {};
  _$jscoverage['/navigation-view/controller.js'].lineData = [];
  _$jscoverage['/navigation-view/controller.js'].lineData[5] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[6] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[7] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[8] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[10] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[11] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[12] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[13] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[14] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[15] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[16] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[17] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[18] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[20] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[22] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[23] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[24] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[25] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[27] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[28] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[30] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[31] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[34] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[37] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[38] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[40] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[41] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[44] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[48] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[52] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[53] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[54] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[55] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[56] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[57] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[68] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[69] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[70] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[71] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[72] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[73] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[74] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[77] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[81] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[85] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[89] = 0;
}
if (! _$jscoverage['/navigation-view/controller.js'].functionData) {
  _$jscoverage['/navigation-view/controller.js'].functionData = [];
  _$jscoverage['/navigation-view/controller.js'].functionData[0] = 0;
  _$jscoverage['/navigation-view/controller.js'].functionData[1] = 0;
  _$jscoverage['/navigation-view/controller.js'].functionData[2] = 0;
  _$jscoverage['/navigation-view/controller.js'].functionData[3] = 0;
  _$jscoverage['/navigation-view/controller.js'].functionData[4] = 0;
  _$jscoverage['/navigation-view/controller.js'].functionData[5] = 0;
  _$jscoverage['/navigation-view/controller.js'].functionData[6] = 0;
  _$jscoverage['/navigation-view/controller.js'].functionData[7] = 0;
  _$jscoverage['/navigation-view/controller.js'].functionData[8] = 0;
}
if (! _$jscoverage['/navigation-view/controller.js'].branchData) {
  _$jscoverage['/navigation-view/controller.js'].branchData = {};
  _$jscoverage['/navigation-view/controller.js'].branchData['15'] = [];
  _$jscoverage['/navigation-view/controller.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/navigation-view/controller.js'].branchData['30'] = [];
  _$jscoverage['/navigation-view/controller.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/navigation-view/controller.js'].branchData['34'] = [];
  _$jscoverage['/navigation-view/controller.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/navigation-view/controller.js'].branchData['37'] = [];
  _$jscoverage['/navigation-view/controller.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/navigation-view/controller.js'].branchData['40'] = [];
  _$jscoverage['/navigation-view/controller.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/navigation-view/controller.js'].branchData['72'] = [];
  _$jscoverage['/navigation-view/controller.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/navigation-view/controller.js'].branchData['73'] = [];
  _$jscoverage['/navigation-view/controller.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/navigation-view/controller.js'].branchData['89'] = [];
  _$jscoverage['/navigation-view/controller.js'].branchData['89'][1] = new BranchData();
}
_$jscoverage['/navigation-view/controller.js'].branchData['89'][1].init(21, 66, 'this.get(\'navigationView\').get(\'activeView\') === this.getSubView()');
function visit23_89_1(result) {
  _$jscoverage['/navigation-view/controller.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/controller.js'].branchData['73'][1].init(22, 35, 'children[i].constructor === SubView');
function visit22_73_1(result) {
  _$jscoverage['/navigation-view/controller.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/controller.js'].branchData['72'][1].init(248, 6, 'i >= 0');
function visit21_72_1(result) {
  _$jscoverage['/navigation-view/controller.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/controller.js'].branchData['40'][1].init(112, 26, 'navigationView.waitingView');
function visit20_40_1(result) {
  _$jscoverage['/navigation-view/controller.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/controller.js'].branchData['37'][1].init(18, 10, 'activeView');
function visit19_37_1(result) {
  _$jscoverage['/navigation-view/controller.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/controller.js'].branchData['34'][1].init(804, 81, '!request.replace || !activeView');
function visit18_34_1(result) {
  _$jscoverage['/navigation-view/controller.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/controller.js'].branchData['30'][1].init(694, 18, 'routes[route.path]');
function visit17_30_1(result) {
  _$jscoverage['/navigation-view/controller.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/controller.js'].branchData['15'][1].init(200, 8, '!subView');
function visit16_15_1(result) {
  _$jscoverage['/navigation-view/controller.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/controller.js'].lineData[5]++;
KISSY.add(function(S, require) {
  _$jscoverage['/navigation-view/controller.js'].functionData[0]++;
  _$jscoverage['/navigation-view/controller.js'].lineData[6]++;
  var Base = require('base');
  _$jscoverage['/navigation-view/controller.js'].lineData[7]++;
  var router = require('router');
  _$jscoverage['/navigation-view/controller.js'].lineData[8]++;
  var Promise = require('promise');
  _$jscoverage['/navigation-view/controller.js'].lineData[10]++;
  function doRoute(request) {
    _$jscoverage['/navigation-view/controller.js'].functionData[1]++;
    _$jscoverage['/navigation-view/controller.js'].lineData[11]++;
    var self = this;
    _$jscoverage['/navigation-view/controller.js'].lineData[12]++;
    var subView = self.getSubView();
    _$jscoverage['/navigation-view/controller.js'].lineData[13]++;
    var navigationView = self.get('navigationView');
    _$jscoverage['/navigation-view/controller.js'].lineData[14]++;
    var activeView = navigationView.get('activeView');
    _$jscoverage['/navigation-view/controller.js'].lineData[15]++;
    if (visit16_15_1(!subView)) {
      _$jscoverage['/navigation-view/controller.js'].lineData[16]++;
      subView = new (self.get('SubView'))();
      _$jscoverage['/navigation-view/controller.js'].lineData[17]++;
      navigationView.addChild(subView);
      _$jscoverage['/navigation-view/controller.js'].lineData[18]++;
      subView.get('el').css('transform', 'translateX(-9999px) translateZ(0)');
    }
    _$jscoverage['/navigation-view/controller.js'].lineData[20]++;
    subView.controller = self;
    _$jscoverage['/navigation-view/controller.js'].lineData[22]++;
    this.getSubView().reset('title');
    _$jscoverage['/navigation-view/controller.js'].lineData[23]++;
    this.defer = new Promise.Defer();
    _$jscoverage['/navigation-view/controller.js'].lineData[24]++;
    this.promise = this.defer.promise;
    _$jscoverage['/navigation-view/controller.js'].lineData[25]++;
    self.enter();
    _$jscoverage['/navigation-view/controller.js'].lineData[27]++;
    var route = request.route;
    _$jscoverage['/navigation-view/controller.js'].lineData[28]++;
    var routes = self.get('routes');
    _$jscoverage['/navigation-view/controller.js'].lineData[30]++;
    if (visit17_30_1(routes[route.path])) {
      _$jscoverage['/navigation-view/controller.js'].lineData[31]++;
      self[routes[route.path]].apply(self, arguments);
    }
    _$jscoverage['/navigation-view/controller.js'].lineData[34]++;
    if (visit18_34_1(!request.replace || !activeView)) {
      _$jscoverage['/navigation-view/controller.js'].lineData[37]++;
      if (visit19_37_1(activeView)) {
        _$jscoverage['/navigation-view/controller.js'].lineData[38]++;
        activeView.controller.leave();
      }
      _$jscoverage['/navigation-view/controller.js'].lineData[40]++;
      if (visit20_40_1(navigationView.waitingView)) {
        _$jscoverage['/navigation-view/controller.js'].lineData[41]++;
        navigationView.waitingView.controller.leave();
      }
      _$jscoverage['/navigation-view/controller.js'].lineData[44]++;
      self.switchView(request, !self.promise.isResolved());
    }
  }
  _$jscoverage['/navigation-view/controller.js'].lineData[48]++;
  return Base.extend({
  router: router, 
  initializer: function() {
  _$jscoverage['/navigation-view/controller.js'].functionData[2]++;
  _$jscoverage['/navigation-view/controller.js'].lineData[52]++;
  var self = this;
  _$jscoverage['/navigation-view/controller.js'].lineData[53]++;
  var path;
  _$jscoverage['/navigation-view/controller.js'].lineData[54]++;
  self.doRoute = S.bind(doRoute, self);
  _$jscoverage['/navigation-view/controller.js'].lineData[55]++;
  var routes = self.get('routes');
  _$jscoverage['/navigation-view/controller.js'].lineData[56]++;
  for (path in routes) {
    _$jscoverage['/navigation-view/controller.js'].lineData[57]++;
    router.get(path, self.doRoute);
  }
}, 
  leave: function() {
  _$jscoverage['/navigation-view/controller.js'].functionData[3]++;
}, 
  enter: function() {
  _$jscoverage['/navigation-view/controller.js'].functionData[4]++;
}, 
  getSubView: function() {
  _$jscoverage['/navigation-view/controller.js'].functionData[5]++;
  _$jscoverage['/navigation-view/controller.js'].lineData[68]++;
  var self = this;
  _$jscoverage['/navigation-view/controller.js'].lineData[69]++;
  var navigationView = self.get('navigationView');
  _$jscoverage['/navigation-view/controller.js'].lineData[70]++;
  var SubView = self.get('SubView');
  _$jscoverage['/navigation-view/controller.js'].lineData[71]++;
  var children = navigationView.get('children');
  _$jscoverage['/navigation-view/controller.js'].lineData[72]++;
  for (var i = children.length - 1; visit21_72_1(i >= 0); i--) {
    _$jscoverage['/navigation-view/controller.js'].lineData[73]++;
    if (visit22_73_1(children[i].constructor === SubView)) {
      _$jscoverage['/navigation-view/controller.js'].lineData[74]++;
      return children[i];
    }
  }
  _$jscoverage['/navigation-view/controller.js'].lineData[77]++;
  return undefined;
}, 
  navigate: function(url, options) {
  _$jscoverage['/navigation-view/controller.js'].functionData[6]++;
  _$jscoverage['/navigation-view/controller.js'].lineData[81]++;
  router.navigate(url, options);
}, 
  switchView: function(request, async) {
  _$jscoverage['/navigation-view/controller.js'].functionData[7]++;
  _$jscoverage['/navigation-view/controller.js'].lineData[85]++;
  this.get('navigationView')[request.backward ? 'pop' : 'push'](this.getSubView(), async);
}, 
  'isSubViewActive': function() {
  _$jscoverage['/navigation-view/controller.js'].functionData[8]++;
  _$jscoverage['/navigation-view/controller.js'].lineData[89]++;
  return visit23_89_1(this.get('navigationView').get('activeView') === this.getSubView());
}}, {
  ATTRS: {
  routes: {}, 
  SubView: {}}});
});
