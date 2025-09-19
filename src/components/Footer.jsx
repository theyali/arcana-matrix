// src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";

export default function Footer() {
  const year = new Date().getFullYear();
  const { t } = useTranslation("common");

  return (
    <footer className="border-t border-muted">
      <div className="container mx-auto px-4 max-w-7xl py-12 grid grid-cols-1 md:grid-cols-3 gap-10 text-sm">
        
        {/* Левая часть */}
        <div>
          <h3 className="font-semibold mb-3" style={{ color: "var(--text)" }}>
            © {year} Tarion
          </h3>
          <p className="opacity-70 text-xs leading-relaxed">
            <Trans i18nKey="footer.rights" ns="common" components={{ b: <b /> }} />
          </p>
        </div>

        {/* Центр — ссылки */}
        <div className="flex flex-col gap-2 text-center md:text-left">
          <Link to="/terms" className="hover:underline opacity-80">
            {t("footer.terms")}
          </Link>
          <Link to="/privacy" className="hover:underline opacity-80">
            {t("footer.privacy")}
          </Link>
          <Link to="/support" className="hover:underline opacity-80">
            {t("footer.support")}
          </Link>
        </div>

        {/* Правая часть — кнопки скачивания */}
        <div className="flex flex-col items-center md:items-end gap-3">
          <span className="font-medium opacity-80 mb-1">{t("footer.download_app")}</span>
          <div className="flex gap-3">
            {/* App Store */}
            <a
              href="https://apple.com/app-store"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 bg-black text-white rounded-xl px-4 py-2 hover:bg-gray-900 transition"
            >
              <img src="/img/app-store.svg" alt="Apple" className="h-6" />
              <div className="flex flex-col leading-tight text-left">
                <span className="text-[10px] opacity-70">{t("footer.appstore.small")}</span>
                <span className="text-sm font-semibold">{t("footer.appstore.big")}</span>
              </div>
            </a>

            {/* Google Play */}
            <a
              href="https://play.google.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 bg-black text-white rounded-xl px-4 py-2 hover:bg-gray-900 transition"
            >
              <img src="/img/google-play.svg" alt="Google Play" className="h-6" />
              <div className="flex flex-col leading-tight text-left">
                <span className="text-[10px] opacity-70">{t("footer.gplay.small")}</span>
                <span className="text-sm font-semibold">{t("footer.gplay.big")}</span>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Низ — иконки оплат */}
      <div className="border-t border-white/10 mt-8 pt-6 pb-4">
        <div className="container mx-auto px-4 max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="opacity-70 text-xs">{t("footer.payments")}</span>
          <div className="flex items-center gap-5">
            <img src="/img//visa.svg" alt="Visa" className="h-6" />
            <img src="/img/mastercard.svg" alt="Mastercard" className="h-6" />
            <img src="/img/mir.svg" alt="Мир" className="h-6" />
          </div>
        </div>
      </div>
    </footer>
  );
}
