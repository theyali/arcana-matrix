// Карточка «Что входит?» — можно использовать на разных страницах
import React from "react";

export default function WhatIncluded({ className = "" }) {
  return (
    <div className={`rounded-2xl p-6 border border-white/10 bg-white/5 ${className}`}>
      <h3 className="font-semibold mb-2">Что входит?</h3>
      <p className="opacity-80 text-sm">
        Доступ к ИИ-Таро, Матрице, анализу ладони и кофе, гороскопам,
        интерпретации снов, анализу лица и почерка, а также форуму и базе
        материалов. Лимиты и приоритет очереди зависят от выбранного тарифа.
      </p>
    </div>
  );
}
