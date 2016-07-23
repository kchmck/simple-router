import {assert} from "chai";

import createRouter from ".";

test("resolvePath", () => {
    let r = createRouter()
        .addRedirect("/c/:param/:action", (p, a) => `/d/${p}-${a}`)
        .addRedirect("/a", () => "/b/42")
        .addRedirect("/b/:param", param => `/c/${param}/delete`);

    assert.deepEqual(r.resolvePath({pathname: "/a"}),
            {pathname: "/d/42-delete"});
    assert.deepEqual(r.resolvePath({pathname: "/abc"}),
            {pathname: "/abc"});
});

test("handlePath", () => {
    let r = createRouter()
        .addRedirect("/c/:param/:action", (p, a) => `/d/${p}-${a}`)
        .addRedirect("/a", () => "/b/42")
        .addRedirect("/b/:param", param => `/c/${param}/delete`)
        .addRoute("/path", () => Promise.resolve(true))
        .addRoute("/node/:num", num => Promise.resolve(num))
        .addRoute("/d/:param", param => Promise.resolve(param));

    return Promise.all([
        r.handlePath({pathname: "/path"})
            .then(x => assert(x)),
        r.handlePath({pathname: "/nope"})
            .catch(() => {}),
        r.handlePath({pathname: "/node/42"})
            .then(node => assert.equal(node, 42)),
        r.handlePath({pathname: "/a"})
            .then(param => assert.equal(param, "42-delete")),
    ]);
});
