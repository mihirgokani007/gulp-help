var chalk = require('chalk');

module.exports = function (gulp) {
  var origTask = gulp.task;

  /**
   * gulp.task(name[, help, deps, fn])
   *
   * Adds `help` to the typical gulp task definition:
   * https://github.com/gulpjs/gulp/blob/master/docs/API.md#gulptaskname-deps-fn
   */
  gulp.task = function(name, help, deps, fn) {
    var task;
    // Do arguments shuffling only when number of given arguments are less than required
    if (arguments.length < 4) {
      // help can be a string or an object; if not, shuffle
      if (typeof help !== 'string' && typeof help !== 'object') {
        fn = deps;
        deps = help;
        help = null;
      }
    }

    origTask.call(gulp, name, deps, fn);
    task = gulp.tasks[name];
    task.help = help;

    return task;
  };

  gulp.task('help', 'Display this help text', function () {
    var name = process.argv[3] || null, help;

    if (!gulp.tasks[name] && process.argv.length > 3) {
      console.log('');
      console.log('Invalid task name: ', name);
    }

    console.log('');
    console.log(chalk.underline('Usage'));

    if (!name) {
      console.log('  gulp [TASK] [OPTIONS...]');
      console.log('');

      console.log(chalk.underline('All Tasks:'));
      Object.keys(gulp.tasks).sort().forEach(function (name) {
        var help = getHelp(gulp.tasks[name]);
        if (help) {
          printHelp(help);
        }
      });
    } else {
      help = getHelp(gulp.tasks[name]);
      if (help) {
        console.log('  gulp ' + name + ' [OPTIONS...]');
        console.log('');

        printHelp(help);
      }
    }

    console.log('');

  });

  // do not add default task if one already exists
  if (gulp.tasks['default'] === undefined) {
    gulp.task('default', ['help']);
  }

  return gulp;
};

function getHelp(task) {
  var name = task.name,
      help = task.help,
      args;
  
  if (!help) {
    return;
  }
  if (typeof help === 'function') {
    help = help(task, name);
  }
  if (typeof help === 'string') {
    help = {msg: help}
  } 

  args = [];
  if (!help.args) {
    args = [];
  } else if (Array.isArray(help.args)) {
    args.push.apply(args, help.args);
  } else {
    Object.keys(help.args).forEach(function(arg) {
      args.push({name: arg, msg: help.args[arg]});
    });
  }

  args = args.map(function(arg) {
    if (typeof arg === 'string') {
      arg = {name: arg}
    } 

    if (!arg.name) {
      throw "arg.name must be specified";
    }

    if (!arg.aliases) {
      arg.aliases = [];
    }

    return arg;
  });

  // Create copy, do not modufy original help object
  help = {msg: help.msg};
  help.name = task.name;
  if (task.deps) {
    help.deps = task.deps;
  }
  if (args.length) {
    help.args = args;
  }

  return help;
}

function printHelp(help) {
  console.log(help);
}

