# 919 — мобильное приложение

Маркетплейс найма 919 (ОАЭ): соискатели и работодатели. Expo SDK 57 · React Native 0.86 · TypeScript · expo-router.
Одна кодовая база на iOS, Android и web (web-сборка — кликабельный прототип по ссылке).

## Запуск

```bash
npm install
npm run web        # прототип в браузере
npm run ios        # / npm run android — через Expo Go или dev build
npm run typecheck
```

## Структура

```
design/tokens.json        выгрузка токенов из 919 Design System (источник правды)
scripts/build-tokens.mjs  tokens.json → src/theme/tokens.ts  (npm run tokens)
src/theme/                тема: цвета light/dark, шрифты Onest + Unbounded, отступы, радиусы
src/icons/icons.ts        иконки из либы (Huge Icons, stroke 1.5)
src/components/           компоненты 1:1 с дизайн-системой
src/app/                  экраны (expo-router): файл = роут
src/app/kit.tsx           витрина всех компонентов в обеих темах
```

## Правила

- **Цвета — только из токенов** (`useTheme().c.*` или имя токена в `color` у `Text`/`Icon`). Никаких hex в экранах.
  Поменяли цвет в дизайн-системе → обновили `design/tokens.json` → `npm run tokens`.
- Тема по умолчанию следует системной; пользователь может зафиксировать светлую или тёмную.
- Новые экраны собираем из `src/components`. Нужного компонента нет — сначала добавляем его в дизайн-систему, потом сюда.
- Кнопки primary без цветной тени. Подтверждения — BottomSheet. Тосты — `useToast()`.
- Продуктовые правила (жизнь вакансии 7 дней, Free/Premium, Urgent 24 ч, контексты чатов) — в документе проекта `919-product-rules.md`.

## Флоу в прототипе

- Гостевая зона: `/guest`, поиск `/guest/search`, вакансия `/vacancy/[id]`
- Вход и регистрация: `/auth/*` (телефон + OTP, email, Apple / Google, восстановление пароля, выбор роли)
- Регистрация соискателя, 5 шагов: `/auth/about` → `/signup/occupation` → `/signup/details` → `/signup/media` (+ запись видео) → `/signup/review`
- Регистрация работодателя: `/employer/type` → `/employer/rep` → `/employer/company` → `/employer/review`; вступление в компанию `/employer/join`; частный рекрутер

Демо-значения: код `000000` — ошибка OTP; пароль `wrong` — ошибка входа; `taken@919.ae` — email занят; `nobody@919.ae` — нет аккаунта; компания LEO'V отклоняет запрос на вступление, остальные одобряют.

## Компоненты

Button · Field · OTPField · SearchBar · Chip · StatusChip · SegmentedTabs · Card / RowGroup / Row · Toggle ·
BottomSheet · AuthSheet · Toast · StatusBanner · EmptyState · Skeleton · ChatBubble / ChatSystemLine / ChatDate
