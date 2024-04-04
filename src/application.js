/* eslint no-param-reassign: ["error", { "props": true,
"ignorePropertyModificationsFor": ["state"] }] */

import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import { uniqueId } from 'lodash';

import parse from './parser.js';
import render from './view.js';
import ru from './locales/ru.js';

const refreshInterval = 5000;

const validate = (url, links) => {
  const schema = yup
    .string()
    .trim()
    .required()
    .url()
    .notOneOf(links);
  return schema.validate(url);
};

const getAllOriginsURL = (url) => {
  const allOriginsGetURL = new URL('https://allorigins.hexlet.app/get');
  allOriginsGetURL.searchParams.set('disableCache', 'true');
  allOriginsGetURL.searchParams.set('url', url);
  return allOriginsGetURL;
};

const addNewPosts = (state, posts) => {
  const newPostsWithId = posts.map((post) => ({ ...post, id: uniqueId() }));
  state.content.posts = [...newPostsWithId, ...state.content.posts];
};

const runFeedsRefresher = (state) => {
  const { feeds } = state.content;
  const oldPosts = state.content.posts;

  const promises = feeds.map((feed) => {
    const { link } = feed;
    const allOriginsURL = getAllOriginsURL(link);
    return axios.get(allOriginsURL).then((response) => {
      const rssXML = response.data.contents;
      const { posts } = parse(rssXML);
      const oldLinks = oldPosts.map((post) => post.link);
      const newPosts = posts.filter((post) => !oldLinks.includes(post.link));
      if (newPosts.length > 0) {
        addNewPosts(state, newPosts);
      }
    });
  });

  Promise.all(promises).finally(() => {
    setTimeout(() => runFeedsRefresher(state), refreshInterval);
  });
};

const runApp = () => {
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
      const initialState = {
        form: {
          state: 'filling',
          error: null,
        },
        content: {
          feeds: [],
          posts: [],
        },
        uiState: {
          modalId: null,
          visitedIds: [],
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
          container: document.querySelector('.modal'),
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

      runFeedsRefresher(watchedState);

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
            const allOriginsURL = getAllOriginsURL(link);
            return axios.get(allOriginsURL);
          })
          .then((response) => {
            const rssXML = response.data.contents;
            const { feed, posts } = parse(rssXML);
            watchedState.content.feeds.push({ ...feed, id: uniqueId(), link: url });
            addNewPosts(watchedState, posts);
            watchedState.form.state = 'finished';
          })
          .catch((error) => {
            const errorKey = error.message;
            watchedState.form.error = errorKey;
            watchedState.form.state = 'failed';
          });
      });

      elements.posts.addEventListener('click', (e) => {
        const { id } = e.target.dataset;
        if (id && !initialState.uiState.visitedIds.includes(id)) {
          watchedState.uiState.visitedIds.push(id);
        }
      });

      elements.modal.container.addEventListener('show.bs.modal', (e) => {
        const { id } = e.relatedTarget.dataset;
        if (!initialState.uiState.visitedIds.includes(id)) {
          watchedState.uiState.visitedIds.push(id);
        }
        watchedState.uiState.modalId = id;
      });
    });
};

export default runApp;
