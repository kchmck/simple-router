import "babel-polyfill";

import pathToRegexp from "path-to-regexp";

export default function createRouter() {
    let redirects = [];
    let routes = [];
    let common = [];

    function add(list, path, fn) {
        list.push([pathToRegexp(path), fn]);
    }

    function addRedirect(path, fn) { add(redirects, path, fn); return this; }
    function addRoute(path, fn) { add(routes, path, fn); return this; }
    function addCommon(path, fn) { add(common, path, fn); return this; }

    function* lookup(list, loc) {
        for (let [re, fn] of list) {
            let ret = re.exec(loc.pathname);

            if (ret === null) {
                continue;
            }

            let [_, ...params] = ret;
            yield fn(...params, loc);
        }
    }

    function resolvePath(origLoc) {
        let loc = Object.assign({}, origLoc);

        for (;;) {
            let {value} = lookup(redirects, loc).next();

            if (!value) {
                return loc;
            }

            loc.pathname = value;
        }
    }

    function handlePath(origLoc) {
        let loc = resolvePath(origLoc);

        return Promise.all(lookup(common, loc))
                      .then(() => new Promise((resolve, reject) => {
                          let {done, value} = lookup(routes, loc).next();

                          if (done) {
                              reject();
                          } else {
                              value.then(resolve);
                          }
                      }));
    }

    return {
        addRoute,
        addCommon,
        addRedirect,
        resolvePath,
        handlePath,
    };
}
