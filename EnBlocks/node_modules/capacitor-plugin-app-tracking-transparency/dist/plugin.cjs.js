'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@capacitor/core');

const AppTrackingTransparency = core.registerPlugin('AppTrackingTransparency', {
    web: () => Promise.resolve().then(function () { return web; }).then((m) => new m.AppTrackingTransparencyWeb()),
});

class AppTrackingTransparencyWeb extends core.WebPlugin {
    getStatus() {
        return Promise.resolve({ status: 'authorized' });
    }
    requestPermission() {
        return Promise.resolve({ status: 'authorized' });
    }
}

var web = /*#__PURE__*/Object.freeze({
    __proto__: null,
    AppTrackingTransparencyWeb: AppTrackingTransparencyWeb
});

exports.AppTrackingTransparency = AppTrackingTransparency;
//# sourceMappingURL=plugin.cjs.js.map
