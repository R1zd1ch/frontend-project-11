/* eslint no-param-reassign: ["error", { "props": true,
"ignorePropertyModificationsFor": ["state", "elements"] }] */

const handleFillingFormState = (elements) => {
  elements.feedback.classList.remove('text-danger');
  elements.feedback.classList.remove('text-success');
  elements.input.classList.remove('is-invalid');
  elements.feedback.textContent = '';
};

const handleSendingFormState = (elements) => {
  elements.btn.disabled = true;
  elements.input.disabled = true;
};

const handleFinishedFormState = (elements, i18nT) => {
  elements.btn.disabled = false;
  elements.input.disabled = false;
  elements.input.focus();
  elements.input.value = '';

  elements.feedback.classList.add('text-success');
  elements.input.classList.remove('is-invalid');
  elements.feedback.textContent = i18nT('success'); // TEMP
};

const handleFailedFormState = (elements, errorKey, i18nT) => {
  elements.btn.disabled = false;
  elements.input.disabled = false;
  elements.input.focus();

  elements.feedback.classList.add('text-danger');
  elements.input.classList.add('is-invalid');
  elements.feedback.textContent = i18nT(`errors.${errorKey}`); // TEMP
};

const handleFormState = (elements, initialState, formState, i18nT) => {
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
      handleFailedFormState(elements, initialState.form.error, i18nT);
      break;
    default:
      break;
  }
};

const render = (elements, initialState, i18nT) => (path, value) => {
  switch (path) {
    case 'form.state':
      handleFormState(elements, initialState, value, i18nT);
      break;

    default:
      break;
  }
};

export default render;
