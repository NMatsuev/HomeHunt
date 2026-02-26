import { I18n } from "i18n-js";
import ru from "./locales/ru";
import en from "./locales/en";

// Создаем экземпляр i18n
const i18n = new I18n({
  ru,
  en,
});

i18n.enableFallback = true;
i18n.defaultLocale = "ru";

export default i18n;
