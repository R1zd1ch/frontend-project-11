### Hexlet tests and linter status:

[![Actions Status](https://github.com/R1zd1ch/frontend-project-11/workflows/hexlet-check/badge.svg)](https://github.com/R1zd1ch/frontend-project-11/actions)
[![Maintainability](https://api.codeclimate.com/v1/badges/685f1ed058e95e073119/maintainability)](https://codeclimate.com/github/R1zd1ch/frontend-project-11/maintainability)
[![CI Status](https://github.com/R1zd1ch/frontend-project-11/actions/workflows/rss-reader.yml/badge.svg)](https://github.com/R1zd1ch/frontend-project-11/actions/workflows/rss-reader.yml)

**[RSS Reader](https://rss-reader-r1zd1ch.vercel.app/)**

## Описание

RSS — специализированный формат, предназначенный для описания лент новостей, анонсов статей и других материалов. Это наиболее простой способ для сайтов (обычно, блогов) дать возможность пользователям подписываться на изменения. Для этого используются специальные сервисы, называемые RSS-агрегаторами. Эти сервисы умеют опрашивать RSS-ленты сайтов на наличие новых постов и показывают их в удобном виде, отмечая прочитанное и так далее.

## Локальная установка для разработчиков

```
git clone https://github.com/R1zd1ch/frontend-project-11.git
cd frontend-project-11
make install
npm link # (You may need sudo)
make build # Build webpack project
make develop # Run webpack dev-server
```