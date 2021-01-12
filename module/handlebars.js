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

  Handlebars.registerHelper("ifEquals", function (arg1, arg2, options) {
    return arg1 == arg2 ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper("ifNotEquals", function (arg1, arg2, options) {
    return arg1 != arg2 ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper("ifGreater", function (arg1, arg2, options) {
    if (arg1 > arg2) {
      return options.fn(this);
    }
    return options.inverse(this);
  });
  Handlebars.registerHelper("ifEGreater", function (arg1, arg2, options) {
    if (arg1 >= arg2) {
      return options.fn(this);
    }
    return options.inverse(this);
  });
  Handlebars.registerHelper("ifOr", function (arg1, arg2, options) {
    if (arg1 || arg2) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  Handlebars.registerHelper("ifAny", function (arg1, arg2, arg3, options) {
    if (arg1 || arg2 || arg3) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  Handlebars.registerHelper(
    "conditionTip",
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
  
  Handlebars.registerHelper('anyEquals', (...args) => {
    const opts = args.pop();
    let compare = args.pop();
    
    for (let i = 0; i < args.length; ++i) {
      if (args[i] == compare) {
        return opts.fn(this);
      }
    }
    return opts.inverse(this);
  });

  /*Retirados do PF2e*/
  Handlebars.registerHelper('add', (a, b) => {
    return a + b;
  });

  Handlebars.registerHelper('if_all', (...args) => {
    const opts = args.pop();

    let { fn } = opts;
    for (let i = 0; i < args.length; ++i) {
      if (args[i]) continue;
      fn = opts.inverse;
      break;
    }
    return fn(this);
  });

  Handlebars.registerHelper('any', (...args) => {
    const opts = args.pop();
    return args.some((v) => !!v) ? opts : opts.inverse;
  });

  Handlebars.registerHelper('not', (arg) => {
    return !arg;
  });

  Handlebars.registerHelper('multiply', (a, b) => {
    return a * b;
  });

  Handlebars.registerHelper('percentage', (value, max) => {
    return (max / 100) * value;
  });
}
