import { WebPlugin } from '@capacitor/core';
export class AppTrackingTransparencyWeb extends WebPlugin {
    getStatus() {
        return Promise.resolve({ status: 'authorized' });
    }
    requestPermission() {
        return Promise.resolve({ status: 'authorized' });
    }
}
//# sourceMappingURL=web.js.map