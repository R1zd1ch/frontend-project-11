import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import render from './view.js';
import ru from './locales/ru.js';

const validate = (url, links) => {
  const schema = yup
    .string()
    .trim()
    .required()
    .url()
    .notOneOf(links);
  return schema.validate(url);
};

const app = () => {
  const i18nInstance = i18next.createInstance();
  i18nInstance
    .init({
      lng: 'ru',
      debug: false,
      resources: {
        ru,
      },
    })
    .then((i18nT) => {
      // filling, sending, finished, failed
      const initialState = {
        form: {
          state: 'filling',
          error: null,
        },
        content: {
          feeds: [],
        },
      };

      const elements = {
        form: document.querySelector('.rss-form'),
        feedback: document.querySelector('.feedback'),
        input: document.querySelector('#url-input'),
        btn: document.querySelector('button[type="submit"]'),
        posts: document.querySelector('.posts'),
        feeds: document.querySelector('.feeds'),
        modal: {
          modalElement: document.querySelector('.modal'),
          title: document.querySelector('.modal-title'),
          body: document.querySelector('.modal-body'),
          btn: document.querySelector('.full-article'),
        },
      };

      yup.setLocale({
        mixed: { notOneOf: 'existingFeed' },
        string: { url: 'invalidLink', required: 'emptyForm' },
      });

      const watchedState = onChange(initialState, render(elements, initialState, i18nT));

      elements.form.addEventListener('input', () => {
        watchedState.form.state = 'filling';
        watchedState.form.error = null;
      });

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(elements.form);
        const url = formData.get('url');
        const links = watchedState.content.feeds.map(({ link }) => link);

        validate(url, links)
          .then((link) => {
            watchedState.form.state = 'sending';
            console.log('sending test'); // eslint-disable-line
            return link;
          })
          .then((feed) => {
            watchedState.form.state = 'finished';
            watchedState.content.feeds.push({ feed, link: url });
            console.log(initialState.content.feeds); // eslint-disable-line
          })
          .catch((error) => {
            const errorKey = error.message;
            watchedState.form.error = errorKey;
            watchedState.form.state = 'failed';
          });
      });
    });
};

export default app;
