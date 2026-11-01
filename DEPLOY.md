# Деплой на GitHub Pages

Проект настроен для автоматического деплоя на GitHub Pages через GitHub Actions.

## Автоматический деплой

После каждого push в ветку `main` автоматически:
1. Собирается production-версия проекта
2. Публикуется на https://dygdyg.github.io/spider/

## Ручной деплой

Если нужно задеплоить вручную:

```bash
# Сборка проекта
npm run build

# Файлы для деплоя находятся в папке dist/
# Загрузите их на GitHub Pages через настройки репозитория
```

## Настройка GitHub Pages

### 1. Включите GitHub Pages

1. Перейдите в Settings → Pages
2. В разделе "Build and deployment" → "Source" выберите "GitHub Actions"
3. Сохраните настройки

### 2. Проверьте workflow

Файл `.github/workflows/deploy.yml` уже настроен и готов к использованию.

### 3. Проверьте деплой

После push в `main`:
1. Перейдите в Actions
2. Найдите workflow "Deploy to GitHub Pages"
3. Дождитесь завершения
4. Откройте https://dygdyg.github.io/spider/

## Конфигурация

### Vite

В `vite.config.js` установлен базовый путь:

```javascript
export default defineConfig({
  base: "/spider/",
  // ...
});
```

Это необходимо для корректной работы на GitHub Pages, где сайт размещается в подпапке `/spider/`.

### Пути к ресурсам

Все пути к ресурсам используют `import.meta.env.BASE_URL`:

```javascript
const baseUrl = import.meta.env.BASE_URL || '/';
const svgPath = `${baseUrl}cards/svg/${suitName}/${fileName}`;
```

Это обеспечивает корректную работу как в разработке, так и на GitHub Pages.

## Проверка перед деплоем

Перед push убедитесь, что:

1. ✅ Проект собирается без ошибок:
   ```bash
   npm run build
   ```

2. ✅ Пути в `dist/index.html` начинаются с `/spider/`:
   ```html
   <script type="module" crossorigin src="/spider/assets/index-*.js"></script>
   <link rel="stylesheet" crossorigin href="/spider/assets/index-*.css">
   ```

3. ✅ Все файлы находятся в `dist/assets/`

4. ✅ localStorage работает корректно (проверьте сохранение игры)

## Troubleshooting

### Игра не загружается

**Проблема:** Белый экран или ошибки 404

**Решение:**
1. Проверьте, что `base: "/spider/"` установлен в `vite.config.js`
2. Убедитесь, что GitHub Pages настроен на использование GitHub Actions
3. Проверьте консоль браузера на ошибки путей

### Ресурсы не загружаются

**Проблема:** CSS или JS файлы не найдены (404)

**Решение:**
1. Проверьте, что пути в `dist/index.html` начинаются с `/spider/`
2. Убедитесь, что файлы существуют в `dist/assets/`
3. Пересоберите проект: `npm run build`

### localStorage не работает

**Проблема:** Игра не сохраняется

**Решение:**
1. Проверьте, что браузер не блокирует localStorage
2. Очистите кэш и cookies
3. Попробуйте в режиме инкогнито

### Старая версия после обновления

**Проблема:** После push изменения не применяются

**Решение:**
1. Дождитесь завершения workflow в Actions
2. Очистите кэш браузера (Ctrl+Shift+R)
3. Проверьте, что workflow завершился успешно

## Локальная проверка

Перед push проверьте production-сборку локально:

```bash
# Сборка
npm run build

# Запуск preview сервера
npm run preview

# Откройте http://localhost:4173/spider/
```

Это имитирует поведение GitHub Pages.

## Структура деплоя

```
dist/
├── index.html          # Главная страница
└── assets/
    ├── index-*.js      # JavaScript bundle
    └── index-*.css     # CSS bundle
```

## Полезные ссылки

- GitHub Pages: https://dygdyg.github.io/spider/
- GitHub Actions: https://github.com/DygDyg/spider/actions
- Репозиторий: https://github.com/DygDyg/spider

## Дополнительная информация

- [Vite Static Deploy](https://vitejs.dev/guide/static-deploy.html)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions](https://docs.github.com/en/actions)
