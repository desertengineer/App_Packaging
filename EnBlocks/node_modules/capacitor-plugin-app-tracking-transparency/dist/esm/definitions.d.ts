export interface AppTrackingTransparencyPlugin {
    getStatus(): Promise<AppTrackingStatusResponse>;
    requestPermission(): Promise<AppTrackingStatusResponse>;
}
export declare type AppTrackingStatusResponse = {
    status: AppTrackingStatus;
};
export declare type AppTrackingStatus = 'authorized' | 'denied' | 'notDetermined' | 'restricted';
