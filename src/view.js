const renderFeeds = (elements, state, i18nT) => {
  const { feeds } = elements;
  feeds.innerHTML = '';

  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18nT('feeds');

  cardBody.append(cardTitle);

  const cardList = document.createElement('ul');
  cardList.classList.add('list-group', 'border-0', 'rounder-0');

  state.content.feeds.forEach((feed) => {
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item', 'border-0', 'border-end-0');

    const listItemTitle = document.createElement('h3');
    listItemTitle.classList.add('h6', 'm-0');
    listItemTitle.textContent = feed.title;

    const listItemDescription = document.createElement('p');
    listItemDescription.classList.add('m-0', 'small', 'text-black-50');
    listItemDescription.textContent = feed.description;

    listItem.append(listItemTitle, listItemDescription);

    cardList.prepend(listItem);
  });

  card.append(cardBody, cardList);

  feeds.append(card);
};

const renderPosts = (elements, state, i18nT) => {
  const { posts } = elements;
  posts.innerHTML = '';

  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18nT('posts');

  cardBody.append(cardTitle);

  const cardList = document.createElement('ul');
  cardList.classList.add('list-group', 'border-0', 'rounder-0');

  state.content.posts.forEach((post) => {
    const listItem = document.createElement('li');
    listItem.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    );

    const listItemLink = document.createElement('a');
    listItemLink.href = post.link;
    listItemLink.classList.add(state.uiState.visitedIds.has(post.id) ? ('fw-normal', 'link-secondary') : 'fw-bold');
    listItemLink.setAttribute('data-id', post.id);
    listItemLink.target = '_blank';
    listItemLink.rel = 'noopener noreferrer';
    listItemLink.textContent = post.title;

    const listItemButton = document.createElement('button');
    listItemButton.type = 'button';
    listItemButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    listItemButton.setAttribute('data-id', post.id);
    listItemButton.setAttribute('data-bs-toggle', 'modal');
    listItemButton.setAttribute('data-bs-target', '#modal');
    listItemButton.textContent = i18nT('preview');

    listItem.append(listItemLink, listItemButton);

    cardList.append(listItem);
  });

  card.append(cardBody, cardList);

  posts.append(card);
};

const renderModal = (elements, state, modalId) => {
  const post = state.content.posts.find(({ id }) => id === modalId);
  const { title, description, link } = post;
  const { modal } = elements;
  modal.title.textContent = title;
  modal.body.textContent = description;
  modal.btn.href = link;
};

const handleFillingFormState = (elements) => {
  const { feedback } = elements;
  elements.feedback.classList.remove('text-danger');
  elements.feedback.classList.remove('text-success');
  elements.input.classList.remove('is-invalid');
  feedback.textContent = '';
  document.querySelector('.mt-2').classList.add('text-secondary');
};

const handleSendingFormState = (elements) => {
  const { btn, input } = elements;
  btn.disabled = true;
  input.disabled = true;
};

const handleFinishedFormState = (elements, i18nT) => {
  const { btn, input, feedback } = elements;
  btn.disabled = false;
  input.disabled = false;
  elements.input.focus();
  input.value = '';

  elements.feedback.classList.remove('text-danger');
  elements.feedback.classList.add('text-success');
  elements.input.classList.remove('is-invalid');
  feedback.textContent = i18nT('success');
};

const handleFailedFormState = (elements, errorKey, i18nT) => {
  const { btn, input, feedback } = elements;
  btn.disabled = false;
  input.disabled = false;
  elements.input.focus();

  elements.feedback.classList.add('text-danger');
  elements.input.classList.add('is-invalid');
  feedback.textContent = i18nT(`errors.${errorKey.replace(' ', '')}`);
};

const handleFormState = (elements, initialState, formState, i18nT) => {
  const loadingError = initialState.loadingState.error;
  const formError = initialState.form.error;
  const errorName = formError !== null ? formError : loadingError;

  switch (formState) {
    case 'filling':
      handleFillingFormState(elements);
      break;
    case 'sending':
      handleSendingFormState(elements);
      break;
    case 'finished':
      handleFinishedFormState(elements, i18nT);
      break;
    case 'failed':
      handleFailedFormState(elements, errorName, i18nT);
      break;
    default:
      break;
  }
};

const render = (elements, initialState, i18nT) => (path, value) => {
  switch (path) {
    case 'content.feeds':
      renderFeeds(elements, initialState, i18nT);
      break;
    case 'content.posts':
    case 'uiState.visitedIds':
      renderPosts(elements, initialState, i18nT);
      break;
    case 'loadingState.state':
    case 'form.state':
      handleFormState(elements, initialState, value, i18nT);
      break;
    case 'uiState.modalId':
      renderModal(elements, initialState, value);
      break;
    default:
      break;
  }
};

export default render;
