const { watch, series, src, dest } = require('gulp');
const rename = require('gulp-rename');
const rm = require('gulp-rm');
const pkg = require('./package');

const modules = pkg.files;

const renameDts = name => {
  const source = `./${name}/${name}.d.ts`;
  const taskName = `rename ${source}`;
  const wrapper = {
    [taskName]: cb => {
      src(source)
        .pipe(rename('index.d.ts'))
        .pipe(dest(`./${name}`));
      cb();
    }
  };
  return wrapper[taskName];
};

const removeDts = name => {
  const source = `./${name}/${name}.d.ts`;
  const taskName = `remove ${source}`;
  const wrapper = {
    [taskName]: cb => {
      src(`./${name}/${name}.d.ts`).pipe(rm());
      cb();
    }
  };
  return wrapper[taskName];
};

exports.default = function() {
  modules.map(name =>
    watch(
      `${name}/${name}.d.ts`,
      { events: ['add', 'change'] },
      series(renameDts(name), removeDts(name))
    )
  );
};
