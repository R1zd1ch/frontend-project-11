import onChange from 'on-change';
import * as yup from 'yup';
import render from './view.js';

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

  const watchedState = onChange(initialState, render(elements));

  elements.form.addEventListener('input', () => {
    watchedState.form.state = 'filling';
    watchedState.form.elements = null;
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
        watchedState.form.state = 'failed';
        console.log(error); // eslint-disable-line
      });
  });
};

export default app;
