import { NativeModules } from 'react-native'
import { setupI18n } from "@lingui/core"
import enUS from '../locales/en_US/messages.js';
import zhTW from '../locales/zh_TW/messages.js';
import zhCN from '../locales/zh_CN/messages.js';
import koKR from '../locales/ko_KR/messages.js';
import arEG from '../locales/ar_EG/messages.js';
import frFR from '../locales/fr_FR/messages.js';
import moment from 'moment';
import 'moment/locale/zh-tw';
import 'moment/locale/zh-cn';
import 'moment/locale/ko';
import 'moment/locale/ar';
import 'moment/locale/fr';
import xarEG from '../locales/ar_EG/extra.js';
import xkoKR from '../locales/ko_KR/extra.js';

// define which locale use which translate file
const supportedLanguage = {
    'en_US': enUS,
    'zh_TW': zhTW,
    'zh_CN': zhCN,
    'ko_KR': koKR,
    'ar_EG': arEG,
    'fr_FR': frFR,
};
const languageExtra = {
    'ar_EG': xarEG,
    'ko_KR': xkoKR,
};

const locale = NativeModules.I18nManager.localeIdentifier; // zh_TW_#Hant, zh_CN_#Hans

export const i18n = setupI18n();
i18n.load(supportedLanguage);
// if the locale is defined, activate it
if (supportedLanguage.hasOwnProperty(locale)) {
    i18n.activate(locale);
    moment.locale(locale);
} else {
    i18n.activate('en_US');
    moment.locale('en_US');
} 
var extra = false;
if (languageExtra.hasOwnProperty(locale)) {
    extra = languageExtra[locale];
}

export const transCity = (string) => {
    if (extra && extra.citiesNames.hasOwnProperty(string)) {
        return extra.citiesNames[string];
    } else {
        return string;
    }
}

export const numToSymbol = (string) => {
    if (extra && extra.hasOwnProperty('numbersMap')) {
        return string.replace(/\d/g, (match) => extra.numbersMap[match]);
    } else {
        return string;
    }
}
export default i18n
