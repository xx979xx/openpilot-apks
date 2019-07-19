import { NativeModules } from 'react-native'
import { setupI18n } from "@lingui/core"
//import zhTW from '../locales/zh-TW/messages.js';

// define which locale use which translate file
let supportedLanguage = {
//    'zh_TW_#Hant': zhTW
};

const locale = NativeModules.I18nManager.localeIdentifier; // zh_TW_#Hant, zh_CN_#Hans

export const i18n = setupI18n();

// if the locale is defined, activate it
if (supportedLanguage.hasOwnProperty(locale)) {
    i18n.load({
        [locale]: supportedLanguage['locale']
    });
    i18n.activate(locale);
}

export default i18n