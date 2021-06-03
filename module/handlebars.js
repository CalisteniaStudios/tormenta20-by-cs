/* global Handlebars */
export function registerHandlebarsHelpers() {
    Handlebars.registerHelper("concat", function () {
    var outStr = "";Chat
    for (var arg in arguments) {
      if (typeof arguments[arg] != "object") {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

  Handlebars.registerHelper("toLowerCase", function (str) {
    return str.toLowerCase();
  });

  Handlebars.registerHelper("toJSONString", function (str) {
    return JSON.stringify(str);
  });

  Handlebars.registerHelper("conditionTip",
    function (context, condition, options) {
      var ret = "";
      for (var prop in context) {
        if (condition == prop) {
          ret = ret + " " + context[prop].tooltip;
        }
      }
      return ret;
    }
  );
	Handlebars.registerHelper("stripTags", function (str) {
    return str.replace(/<[^>]*>?/gm, '');
  });
	
  Handlebars.registerHelper('add', (a, b) => {
    return a + b;
  });
	
	Handlebars.registerHelper('divide', (a, b) => {
    return a / b;
  });

  Handlebars.registerHelper('multiply', (a, b) => {
    return a * b;
  });

  Handlebars.registerHelper("find", function (arr, key, value) {
    return arr.find(i => i[key] == value) ? true : false;
  });
}
