import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import { uniqueId } from 'lodash';

import parse from './parser.js';
import render from './view.js';
import resources from './locales/index.js';

const refreshInterval = 5000;

const validate = (url, links) => {
  const schema = yup
    .string()
    .required()
    .url()
    .notOneOf(links);
  try {
    schema.validateSync(url);
    return null;
  } catch (e) {
    return e.message;
  }
};

const getAllOriginsURL = (url) => {
  const allOriginsGetURL = new URL('https://allorigins.hexlet.app/get');
  allOriginsGetURL.searchParams.set('disableCache', 'true');
  allOriginsGetURL.searchParams.set('url', url);
  return allOriginsGetURL;
};

const addNewPosts = (state, posts) => {
  const newPostsWithId = posts.map((post) => ({ ...post, id: uniqueId() }));
  state.content.posts.unshift(...newPostsWithId);
};

const runFeedsRefresher = (state) => {
  const { feeds } = state.content;
  const oldPosts = state.content.posts;
  const promises = feeds.map((feed) => {
    const { id, link } = feed;
    const allOriginsURL = getAllOriginsURL(link);
    return axios.get(allOriginsURL)
      .then((response) => {
        const rssXML = response.data.contents;
        const { posts } = parse(rssXML);
        const oldLinks = oldPosts.map((post) => post.link);
        const newPosts = posts.filter((post) => !oldLinks.includes(post.link));
        if (newPosts.length > 0) {
          addNewPosts(state, newPosts);
        }
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(`Error loading feed from ${id}:`, error);
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
      resources,
    })
    .then((i18nT) => {
      const initialState = {
        form: {
          state: 'filling',
          error: null,
        },
        loadingState: {
          state: 'idle',
          error: null,
        },
        content: {
          feeds: [],
          posts: [],
        },
        uiState: {
          modalId: null,
          visitedIds: new Set(),
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

      const loadRss = (url) => {
        watchedState.loadingState.state = 'loading';
        watchedState.loadingState.error = null;

        return axios.get(getAllOriginsURL(url))
          .then((response) => {
            const rssXML = response.data.contents;
            const { feed, posts } = parse(rssXML);
            watchedState.content.feeds.push({ ...feed, id: uniqueId(), link: url });
            addNewPosts(watchedState, posts);
            watchedState.loadingState.state = 'idle';
            watchedState.form.state = 'finished';
          })
          .catch((error) => {
            const errorKey = error.message;
            watchedState.loadingState.error = errorKey;
            watchedState.loadingState.state = 'failed';
          });
      };

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const url = formData.get('url');
        const links = watchedState.content.feeds.map(({ link }) => link);

        const error = validate(url, links);
        if (error) {
          watchedState.form.error = error;
          watchedState.form.state = 'failed';
          return;
        }

        watchedState.form.state = 'sending';

        loadRss(url);
      });

      elements.posts.addEventListener('click', (e) => {
        const { id } = e.target.dataset;
        if (id && !initialState.uiState.visitedIds.has(id)) {
          watchedState.uiState.visitedIds.add(id);
        }
        watchedState.uiState.modalId = id;
      });
      runFeedsRefresher(watchedState);
    });
};

export default runApp;
