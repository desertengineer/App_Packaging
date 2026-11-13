import { registerPlugin } from '@capacitor/core';
const AppTrackingTransparency = registerPlugin('AppTrackingTransparency', {
    web: () => import('./web').then((m) => new m.AppTrackingTransparencyWeb()),
});
export * from './definitions';
export { AppTrackingTransparency };
//# sourceMappingURL=index.js.map