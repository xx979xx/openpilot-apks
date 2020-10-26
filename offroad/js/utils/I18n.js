import { NativeModules } from 'react-native'
import { setupI18n } from "@lingui/core"
import enUS from '../locales/en_US/messages.js';
import zhTW from '../locales/zh_TW/messages.js';
import zhCN from '../locales/zh_CN/messages.js';
import frFR from '../locales/fr_FR/messages.js';
import jaJP from '../locales/ja_JP/messages.js';
import ptBR from '../locales/pt_BR/messages.js';
import koKR from '../locales/ko_KR/messages.js';
import deDE from '../locales/de_DE/messages.js';
import arEG from '../locales/ar_EG/messages.js';
import xkoKR from '../locales/ko_KR/extra.js';
import xarEG from '../locales/ar_EG/extra.js';

import moment from 'moment';
import 'moment/locale/zh-tw';
import 'moment/locale/zh-cn';
import 'moment/locale/fr';
import 'moment/locale/ja';
import 'moment/locale/pt-br';
import 'moment/locale/ko';
import 'moment/locale/de';
import 'moment/locale/ar';

// define which locale use which translate file
let supportedLanguage = {
    'en_US': enUS,
    'zh_TW': zhTW,
    'zh_CN': zhCN,
    'fr_FR': frFR,
    'ja_JP': jaJP,
    'pt_BR': ptBR,
    'ko_KR': koKR,
    'de_DE': deDE,
    'ar_EG': arEG,
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
