import { WebPlugin } from '@capacitor/core';
import type { AppTrackingTransparencyPlugin, AppTrackingStatusResponse } from './definitions';
export declare class AppTrackingTransparencyWeb extends WebPlugin implements AppTrackingTransparencyPlugin {
    getStatus(): Promise<AppTrackingStatusResponse>;
    requestPermission(): Promise<AppTrackingStatusResponse>;
}
