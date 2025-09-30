import { getLocales } from "expo-localization"
import { I18n } from "i18n-js"
import en from "@/public/locales/en/translation.json"
import fr from "@/public/locales/fr/translation.json"

const i18n = new I18n()

//--- Set i18n to User's language ---//
i18n.locale = getLocales()[0].languageCode as string
i18n.translations = { en, fr }

export default i18n
