// src/components/predictions/PhotoTips.jsx
import React from "react";
import { Trans, useTranslation } from "react-i18next";

export default function PhotoTips({ maxSizeMb = 12 }) {
  const { t } = useTranslation("common");

  return (
    <section className="mt-10 grid lg:grid-cols-3 gap-6">
      <div className="rounded-2xl p-6 border border-white/10 bg-white/5">
        <h3 className="font-semibold mb-3">{t("photo_tips.how.title")}</h3>
        <ol className="list-decimal list-inside space-y-2 opacity-90 text-sm">
          <li><Trans i18nKey="photo_tips.how.1" /></li>
          <li><Trans i18nKey="photo_tips.how.2" /></li>
          <li><Trans i18nKey="photo_tips.how.3" components={{ b: <b /> }} /></li>
          <li><Trans i18nKey="photo_tips.how.4" components={{ b: <b /> }} /></li>
          <li>
            <Trans i18nKey="photo_tips.how.5" values={{ max: maxSizeMb }} />
          </li>
        </ol>
      </div>

      <div className="rounded-2xl p-6 border border-white/10 bg-white/5">
        <h3 className="font-semibold mb-3">{t("photo_tips.good.title")}</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: "🤚", label: t("photo_tips.good.left.label"), hint: t("photo_tips.good.left.hint") },
            { icon: "🖐️", label: t("photo_tips.good.right.label"), hint: t("photo_tips.good.right.hint") },
            { icon: "🔍", label: t("photo_tips.good.zoom.label"), hint: t("photo_tips.good.zoom.hint") },
          ].map((x, i) => (
            <div
              key={i}
              className="rounded-xl p-3 text-center border border-white/10 bg-gradient-to-br from-[var(--primary)]/15 to-[var(--accent)]/15"
            >
              <div className="text-2xl mb-2">{x.icon}</div>
              <div className="text-xs font-semibold">{x.label}</div>
              <div className="text-[11px] opacity-70">{x.hint}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl p-6 border border-white/10 bg-white/5">
        <h3 className="font-semibold mb-3">{t("photo_tips.bad.title")}</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: "⚡", title: t("photo_tips.bad.flash.title"), hint: t("photo_tips.bad.flash.hint") },
            { icon: "🌀", title: t("photo_tips.bad.blurry.title"), hint: t("photo_tips.bad.blurry.hint") },
            { icon: "↔️", title: t("photo_tips.bad.far.title"), hint: t("photo_tips.bad.far.hint") },
          ].map((x, i) => (
            <div key={i} className="rounded-xl p-3 text-center border border-white/10 bg-white/5">
              <div className="text-2xl mb-2">{x.icon}</div>
              <div className="text-xs font-semibold">{x.title}</div>
              <div className="text-[11px] opacity-70">{x.hint}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
