var capacitorStripe = (function (exports, core) {
    'use strict';

    exports.MaxAdContentRating = void 0;
    (function (MaxAdContentRating) {
        /**
         * Content suitable for general audiences, including families.
         */
        MaxAdContentRating["General"] = "General";
        /**
         * Content suitable for most audiences with parental guidance.
         */
        MaxAdContentRating["ParentalGuidance"] = "ParentalGuidance";
        /**
         * Content suitable for teen and older audiences.
         */
        MaxAdContentRating["Teen"] = "Teen";
        /**
         * Content suitable only for mature audiences.
         */
        MaxAdContentRating["MatureAudience"] = "MatureAudience";
    })(exports.MaxAdContentRating || (exports.MaxAdContentRating = {}));

    // This enum should be keep in sync with their native equivalents with the same name
    exports.BannerAdPluginEvents = void 0;
    (function (BannerAdPluginEvents) {
        /**
         * Emits when the displayed banner size changes.
         */
        BannerAdPluginEvents["SizeChanged"] = "bannerAdSizeChanged";
        /**
         * Emits when a banner ad has loaded.
         */
        BannerAdPluginEvents["Loaded"] = "bannerAdLoaded";
        /**
         * Emits when a banner ad fails to load.
         */
        BannerAdPluginEvents["FailedToLoad"] = "bannerAdFailedToLoad";
        /**
         * Emits when a banner opens an overlay after the user taps it.
         */
        BannerAdPluginEvents["Opened"] = "bannerAdOpened";
        /**
         * Emits when the banner overlay is closed.
         */
        BannerAdPluginEvents["Closed"] = "bannerAdClosed";
        /**
         * Emits when an impression is recorded for the banner ad.
         */
        BannerAdPluginEvents["AdImpression"] = "bannerAdImpression";
        /**
         * Emits impression-level ad revenue data when a paid event is recorded.
         */
        BannerAdPluginEvents["AdPaid"] = "bannerAdPaid";
    })(exports.BannerAdPluginEvents || (exports.BannerAdPluginEvents = {}));

    /**
     * @see https://developer.android.com/reference/android/widget/LinearLayout#attr_android:gravity
     */
    exports.BannerAdPosition = void 0;
    (function (BannerAdPosition) {
        /**
         * Positions the banner at the top center of the screen.
         */
        BannerAdPosition["TOP_CENTER"] = "TOP_CENTER";
        /**
         * Positions the banner at the center of the screen.
         */
        BannerAdPosition["CENTER"] = "CENTER";
        /**
         * Positions the banner at the bottom center of the screen.
         */
        BannerAdPosition["BOTTOM_CENTER"] = "BOTTOM_CENTER";
    })(exports.BannerAdPosition || (exports.BannerAdPosition = {}));

    /**
     *  For more information:
     *  https://developers.google.com/admob/ios/banner#banner_sizes
     *  https://developers.google.com/android/reference/com/google/android/gms/ads/AdSize
     *
     * */
    exports.BannerAdSize = void 0;
    (function (BannerAdSize) {
        /**
         * Mobile Marketing Association (MMA)
         * banner ad size (320x50 density-independent pixels).
         */
        BannerAdSize["BANNER"] = "BANNER";
        /**
         * Interactive Advertising Bureau (IAB)
         * full banner ad size (468x60 density-independent pixels).
         */
        BannerAdSize["FULL_BANNER"] = "FULL_BANNER";
        /**
         * Large banner ad size (320x100 density-independent pixels).
         */
        BannerAdSize["LARGE_BANNER"] = "LARGE_BANNER";
        /**
         * Interactive Advertising Bureau (IAB)
         * medium rectangle ad size (300x250 density-independent pixels).
         */
        BannerAdSize["MEDIUM_RECTANGLE"] = "MEDIUM_RECTANGLE";
        /**
         * Interactive Advertising Bureau (IAB)
         * leaderboard ad size (728x90 density-independent pixels).
         */
        BannerAdSize["LEADERBOARD"] = "LEADERBOARD";
        /**
         * A dynamically sized banner that is full-width and auto-height.
         */
        BannerAdSize["ADAPTIVE_BANNER"] = "ADAPTIVE_BANNER";
        /**
         * A legacy smart banner sized to the screen width.
         * Retained for compatibility; use `ADAPTIVE_BANNER` for new integrations.
         *
         * @deprecated Use `ADAPTIVE_BANNER` instead.
         */
        BannerAdSize["SMART_BANNER"] = "SMART_BANNER";
    })(exports.BannerAdSize || (exports.BannerAdSize = {}));

    // This enum should be keep in sync with their native equivalents with the same name
    exports.InterstitialAdPluginEvents = void 0;
    (function (InterstitialAdPluginEvents) {
        /**
         * Emits when an interstitial ad has loaded and is ready to show.
         */
        InterstitialAdPluginEvents["Loaded"] = "interstitialAdLoaded";
        /**
         * Emits when an interstitial ad fails to load.
         */
        InterstitialAdPluginEvents["FailedToLoad"] = "interstitialAdFailedToLoad";
        /**
         * Emits when an interstitial ad is shown.
         */
        InterstitialAdPluginEvents["Showed"] = "interstitialAdShowed";
        /**
         * Emits when a loaded interstitial ad fails to show.
         */
        InterstitialAdPluginEvents["FailedToShow"] = "interstitialAdFailedToShow";
        /**
         * Emits when an interstitial ad is dismissed.
         */
        InterstitialAdPluginEvents["Dismissed"] = "interstitialAdDismissed";
        /**
         * Emits impression-level ad revenue data when a paid event is recorded.
         */
        InterstitialAdPluginEvents["AdImpression"] = "interstitialAdImpression";
    })(exports.InterstitialAdPluginEvents || (exports.InterstitialAdPluginEvents = {}));

    // This enum should be keep in sync with their native equivalents with the same name
    exports.RewardInterstitialAdPluginEvents = void 0;
    (function (RewardInterstitialAdPluginEvents) {
        /**
         * Emits when a rewarded interstitial ad has loaded and is ready to show.
         */
        RewardInterstitialAdPluginEvents["Loaded"] = "onRewardedInterstitialAdLoaded";
        /**
         * Emits when a rewarded interstitial ad fails to load.
         */
        RewardInterstitialAdPluginEvents["FailedToLoad"] = "onRewardedInterstitialAdFailedToLoad";
        /**
         * Emits when a rewarded interstitial ad is shown.
         */
        RewardInterstitialAdPluginEvents["Showed"] = "onRewardedInterstitialAdShowed";
        /**
         * Emits when a loaded rewarded interstitial ad fails to show.
         */
        RewardInterstitialAdPluginEvents["FailedToShow"] = "onRewardedInterstitialAdFailedToShow";
        /**
         * Emits when a rewarded interstitial ad is dismissed.
         *
         * This event does not indicate whether the user earned a reward. Listen for
         * `Rewarded` separately before granting the reward.
         */
        RewardInterstitialAdPluginEvents["Dismissed"] = "onRewardedInterstitialAdDismissed";
        /**
         * Emits when the user earns the advertised reward.
         */
        RewardInterstitialAdPluginEvents["Rewarded"] = "onRewardedInterstitialAdReward";
        /**
         * Emits impression-level ad revenue data when a paid event is recorded.
         */
        RewardInterstitialAdPluginEvents["AdImpression"] = "onRewardedInterstitialAdImpression";
    })(exports.RewardInterstitialAdPluginEvents || (exports.RewardInterstitialAdPluginEvents = {}));

    // This enum should be keep in sync with their native equivalents with the same name
    exports.RewardAdPluginEvents = void 0;
    (function (RewardAdPluginEvents) {
        /**
         * Emits when a rewarded ad has loaded and is ready to show.
         */
        RewardAdPluginEvents["Loaded"] = "onRewardedVideoAdLoaded";
        /**
         * Emits when a rewarded ad fails to load.
         */
        RewardAdPluginEvents["FailedToLoad"] = "onRewardedVideoAdFailedToLoad";
        /**
         * Emits when a rewarded ad is shown.
         */
        RewardAdPluginEvents["Showed"] = "onRewardedVideoAdShowed";
        /**
         * Emits when a loaded rewarded ad fails to show.
         */
        RewardAdPluginEvents["FailedToShow"] = "onRewardedVideoAdFailedToShow";
        /**
         * Emits when a rewarded ad is dismissed.
         *
         * This event does not indicate whether the user earned a reward. Listen for
         * `Rewarded` separately before granting the reward.
         */
        RewardAdPluginEvents["Dismissed"] = "onRewardedVideoAdDismissed";
        /**
         * Emits when the user earns the advertised reward.
         */
        RewardAdPluginEvents["Rewarded"] = "onRewardedVideoAdReward";
        /**
         * Emits impression-level ad revenue data when a paid event is recorded.
         */
        RewardAdPluginEvents["AdImpression"] = "onRewardedVideoAdImpression";
    })(exports.RewardAdPluginEvents || (exports.RewardAdPluginEvents = {}));

    /**
     *  For more information:
     *  https://developers.google.com/admob/unity/reference/namespace/google-mobile-ads/ump/api#consentstatus
     *
     * */
    exports.AdmobConsentStatus = void 0;
    (function (AdmobConsentStatus) {
        /**
         * User consent not required.
         */
        AdmobConsentStatus["NOT_REQUIRED"] = "NOT_REQUIRED";
        /**
         * User consent already obtained.
         */
        AdmobConsentStatus["OBTAINED"] = "OBTAINED";
        /**
         * User consent required but not yet obtained.
         */
        AdmobConsentStatus["REQUIRED"] = "REQUIRED";
        /**
         * Unknown consent status, AdsConsent.requestInfoUpdate needs to be called to update it.
         */
        AdmobConsentStatus["UNKNOWN"] = "UNKNOWN";
    })(exports.AdmobConsentStatus || (exports.AdmobConsentStatus = {}));

    /**
     *  For more information:
     *  https://developers.google.com/admob/unity/reference/namespace/google-mobile-ads/ump/api#debuggeography
     *
     * */
    exports.AdmobConsentDebugGeography = void 0;
    (function (AdmobConsentDebugGeography) {
        /**
         * Debug geography disabled.
         */
        AdmobConsentDebugGeography[AdmobConsentDebugGeography["DISABLED"] = 0] = "DISABLED";
        /**
         * Geography appears as in EEA for debug devices.
         */
        AdmobConsentDebugGeography[AdmobConsentDebugGeography["EEA"] = 1] = "EEA";
        /**
         * Geography appears as not in EEA for debug devices.
         * @deprecated
         */
        AdmobConsentDebugGeography[AdmobConsentDebugGeography["NOT_EEA"] = 2] = "NOT_EEA";
        /**
         * Geography appears as in regulated US state for debug devices.
         */
        AdmobConsentDebugGeography[AdmobConsentDebugGeography["US"] = 3] = "US";
        /**
         * Geography appears as OTHER state for debug devices.
         */
        AdmobConsentDebugGeography[AdmobConsentDebugGeography["OTHER"] = 4] = "OTHER";
    })(exports.AdmobConsentDebugGeography || (exports.AdmobConsentDebugGeography = {}));

    /**
     * The precision of an impression-level ad value.
     */
    exports.AdValuePrecision = void 0;
    (function (AdValuePrecision) {
        /**
         * The ad value precision is unknown.
         */
        AdValuePrecision[AdValuePrecision["Unknown"] = 0] = "Unknown";
        /**
         * The ad value is estimated from aggregated data.
         */
        AdValuePrecision[AdValuePrecision["Estimated"] = 1] = "Estimated";
        /**
         * The ad value was provided by the publisher.
         */
        AdValuePrecision[AdValuePrecision["PublisherProvided"] = 2] = "PublisherProvided";
        /**
         * The ad value is the precise value paid for this ad.
         */
        AdValuePrecision[AdValuePrecision["Precise"] = 3] = "Precise";
    })(exports.AdValuePrecision || (exports.AdValuePrecision = {}));

    exports.AppOpenAdPluginEvents = void 0;
    (function (AppOpenAdPluginEvents) {
        /**
         * Emits when an App Open ad has loaded.
         */
        AppOpenAdPluginEvents["Loaded"] = "appOpenAdLoaded";
        /**
         * Emits when an App Open ad fails to load.
         */
        AppOpenAdPluginEvents["FailedToLoad"] = "appOpenAdFailedToLoad";
        /**
         * Emits when an App Open ad is shown.
         */
        AppOpenAdPluginEvents["Opened"] = "appOpenAdOpened";
        /**
         * Emits when an App Open ad is dismissed.
         */
        AppOpenAdPluginEvents["Closed"] = "appOpenAdClosed";
        /**
         * Emits when a loaded App Open ad fails to show.
         */
        AppOpenAdPluginEvents["FailedToShow"] = "appOpenAdFailedToShow";
        /**
         * Emits impression-level ad revenue data when a paid event is recorded.
         */
        AppOpenAdPluginEvents["AdImpression"] = "appOpenAdImpression";
    })(exports.AppOpenAdPluginEvents || (exports.AppOpenAdPluginEvents = {}));

    const AdMob = core.registerPlugin('AdMob', {
        web: () => Promise.resolve().then(function () { return web; }).then((m) => new m.AdMobWeb()),
    });

    /**
     *  For more information:
     *  https://developers.google.com/admob/unity/reference/namespace/google-mobile-ads/ump/api#privacyoptionsrequirementstatus
     *
     * */
    var PrivacyOptionsRequirementStatus;
    (function (PrivacyOptionsRequirementStatus) {
        /**
         * Privacy options entry point is not required.
         */
        PrivacyOptionsRequirementStatus["NOT_REQUIRED"] = "NOT_REQUIRED";
        /**
         * Privacy options entry point is required.
         */
        PrivacyOptionsRequirementStatus["REQUIRED"] = "REQUIRED";
        /**
         * Privacy options requirement status is unknown.
         */
        PrivacyOptionsRequirementStatus["UNKNOWN"] = "UNKNOWN";
    })(PrivacyOptionsRequirementStatus || (PrivacyOptionsRequirementStatus = {}));

    class AdMobWeb extends core.WebPlugin {
        async initialize() {
            console.log('initialize');
        }
        async requestTrackingAuthorization() {
            console.log('requestTrackingAuthorization');
        }
        async trackingAuthorizationStatus() {
            return {
                status: 'authorized',
            };
        }
        async requestConsentInfo(options) {
            console.log('requestConsentInfo', options);
            return {
                status: exports.AdmobConsentStatus.REQUIRED,
                isConsentFormAvailable: true,
                canRequestAds: true,
                privacyOptionsRequirementStatus: PrivacyOptionsRequirementStatus.REQUIRED,
            };
        }
        async showPrivacyOptionsForm() {
            console.log('showPrivacyOptionsForm');
        }
        async showConsentForm() {
            console.log('showConsentForm');
            return {
                status: exports.AdmobConsentStatus.REQUIRED,
                canRequestAds: true,
                privacyOptionsRequirementStatus: PrivacyOptionsRequirementStatus.REQUIRED,
            };
        }
        async resetConsentInfo() {
            console.log('resetConsentInfo');
        }
        async setApplicationMuted(options) {
            console.log('setApplicationMuted', options);
        }
        async setApplicationVolume(options) {
            console.log('setApplicationVolume', options);
        }
        async showBanner(options) {
            console.log('showBanner', options);
        }
        async hideBanner() {
            console.log('hideBanner');
        }
        async resumeBanner() {
            console.log('resumeBanner');
        }
        async removeBanner() {
            console.log('removeBanner');
        }
        async prepareInterstitial(options) {
            console.log('prepareInterstitial', options);
            return {
                adUnitId: options.adId,
            };
        }
        async showInterstitial(options) {
            console.log('showInterstitial', options);
        }
        async prepareRewardVideoAd(options) {
            console.log('prepareRewardVideoAd', options);
            return {
                adUnitId: options.adId,
            };
        }
        async showRewardVideoAd(options) {
            console.log('showRewardVideoAd', options);
            return {
                type: '',
                amount: 0,
            };
        }
        async prepareRewardInterstitialAd(options) {
            console.log('prepareRewardInterstitialAd', options);
            return {
                adUnitId: options.adId,
            };
        }
        async showRewardInterstitialAd(options) {
            console.log('showRewardInterstitialAd', options);
            return {
                type: '',
                amount: 0,
            };
        }
        async loadAppOpen(options) {
            console.log('loadAppOpen', options);
            return {
                adUnitId: options.adId,
            };
        }
        async showAppOpen(options) {
            console.log('showAppOpen', options);
        }
        async isAppOpenLoaded() {
            return { value: false };
        }
        addListener(eventName, listenerFunc) {
            console.log('addListener', eventName);
            return Promise.resolve({ remove: () => Promise.resolve() });
        }
    }

    var web = /*#__PURE__*/Object.freeze({
        __proto__: null,
        AdMobWeb: AdMobWeb
    });

    exports.AdMob = AdMob;

    return exports;

})({}, capacitorExports);
//# sourceMappingURL=plugin.js.map
