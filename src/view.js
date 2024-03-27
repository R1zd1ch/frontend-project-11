/* eslint no-param-reassign: ["error", { "props": true,
"ignorePropertyModificationsFor": ["state", "elements"] }] */

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

const handleFinishedFormState = (elements) => {
  elements.btn.disabled = false;
  elements.input.disabled = false;
  elements.input.focus();
  elements.input.value = '';

  elements.feedback.classList.add('text-success');
  elements.input.classList.remove('is-invalid');
  elements.feedback.textContent = 'RSS успешно загружен'; // TEMP
};

const handleFailedFormState = (elements) => {
  elements.btn.disabled = false;
  elements.input.disabled = false;
  elements.input.focus();

  elements.feedback.classList.add('text-danger');
  elements.input.classList.add('is-invalid');
  elements.feedback.textContent = 'Ссылка должна быть валидной URL'; // TEMP
};

const handleFormState = (elements, state) => {
  switch (state) {
    case 'filling':
      handleFillingFormState(elements);
      break;
    case 'sending':
      handleSendingFormState(elements);
      break;
    case 'finished':
      handleFinishedFormState(elements);
      break;
    case 'failed':
      handleFailedFormState(elements);
      break;
    default:
      break;
  }
};

const render = (elements) => (path, value) => {
  switch (path) {
    case 'form.state':
      handleFormState(elements, value);
      break;

    default:
      break;
  }
};

export default render;
