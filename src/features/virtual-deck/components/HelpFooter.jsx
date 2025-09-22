// src/features/virtual-deck/components/HelpFooter.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Hand,
  Eye,
  EyeOff,
  Undo2,
  Shuffle,
  Wand2,
  Zap,
  Layers,
  Eraser,
  RotateCcw,
  Search,
} from "lucide-react";

/**
 * Подвал-подсказка.
 * props:
 *  - quotaRemaining?: number|null — если 0, покажем подсказку о лимите
 */
export default function HelpFooter({ quotaRemaining = null }) {
  const { t } = useTranslation();

  const Row = ({ icon: Icon, text }) => (
    <div className="flex items-start gap-3">
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 border border-white/10">
        <Icon className="h-4 w-4" />
      </span>
      <p className="text-sm opacity-90">{text}</p>
    </div>
  );

  const showQuotaNote = quotaRemaining !== null && Number(quotaRemaining) <= 0;

  return (
    <section className="mt-8 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm text-white">
      <h3 className="font-semibold mb-3">{t("vd.help.title")}</h3>

      {/* Действия пользователя */}
      <div className="space-y-2 mb-4">
        <Row icon={Hand} text={t("vd.help.actions.single_click")} />
        <Row icon={Search} text={t("vd.help.actions.double_click")} />
        <Row icon={Eye} text={t("vd.help.actions.sidebar_click")} />
        <Row icon={Search} text={t("vd.help.actions.sidebar_zoom")} />
        <Row icon={Wand2} text={t("vd.help.actions.ai_button")} />
      </div>

      {/* Иконки панели */}
      <div>
        <div className="text-sm font-medium mb-2 opacity-90">{t("vd.help.icons_title")}</div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <Row icon={Hand} text={t("vd.help.icons.take")} />
          <Row icon={Eye} text={t("vd.help.icons.flip_all")} />
          <Row icon={EyeOff} text={t("vd.help.icons.hide_all")} />
          <Row icon={Undo2} text={t("vd.help.icons.undo")} />
          <Row icon={Shuffle} text={t("vd.help.icons.shuffle")} />
          <Row icon={Wand2} text={t("vd.help.icons.auto_flip")} />
          <Row icon={Zap} text={t("vd.help.icons.anim_speed")} />
          <Row icon={Layers} text={t("vd.help.icons.toggle_deck")} />
          <Row icon={Eraser} text={t("vd.help.icons.clear")} />
          <Row icon={RotateCcw} text={t("vd.help.icons.reset")} />
        </div>
      </div>

      {/* Примечание о лимите */}
      {showQuotaNote && (
        <div className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-amber-100">
          {t("vd.help.quota_note", "You've reached your free weekly limit. Upgrade your plan to continue.")}
        </div>
      )}
    </section>
  );
}
