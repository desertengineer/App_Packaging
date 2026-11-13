var capacitorAppTrackingTransparency = (function (exports, core) {
    'use strict';

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

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({}, capacitorExports);
//# sourceMappingURL=plugin.js.map
