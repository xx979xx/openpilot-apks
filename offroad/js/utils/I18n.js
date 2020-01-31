import { NativeModules } from 'react-native'
import { setupI18n } from "@lingui/core"
import enUS from '../locales/en_US/messages.js';
import zhTW from '../locales/zh_TW/messages.js';
import zhCN from '../locales/zh_CN/messages.js';
import koKR from '../locales/ko_KR/messages.js';
import arEG from '../locales/ar_EG/messages.js';
import moment from 'moment';
import 'moment/locale/zhTW';
import 'moment/locale/zhCN';
import 'moment/locale/ko';
import 'moment/locale/ar';

// define which locale use which translate file
let supportedLanguage = {
    'zh_TW': zhTW,
    'zh_CN': zhCN,
    'ko_KR': ko,
    'ar_EG': ar,
};

const locale = NativeModules.I18nManager.localeIdentifier; // zh_TW_#Hant, zh_CN_#Hans

export const i18n = setupI18n();
i18n.load(supportedLanguage);
// if the locale is defined, activate it
if (supportedLanguage.hasOwnProperty(locale)) {
    i18n.activate(locale);
    moment.locale(supportedLanguage[locale])
} else {
    i18n.activate('en_US');
}
export default i18n
