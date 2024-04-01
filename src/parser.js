const domParser = new DOMParser();

const parse = (xml) => {
  const parsedDOM = domParser.parseFromString(xml, 'application/xml');
  const parsingError = parsedDOM.querySelector('parseerror');
  if (parsingError) throw new Error('parsingError');

  const channel = parsedDOM.querySelector('channel');
  if (!channel) throw new Error('No channel found in XML');

  const titleElement = channel.querySelector('title');
  const title = titleElement ? titleElement.textContent : '';

  const descriptionElement = channel.querySelector('description');
  const description = descriptionElement ? descriptionElement.textContent : '';

  const feed = { title, description };

  const items = parsedDOM.querySelectorAll('item');
  const posts = Array.from(items).map((item) => {
    const postLinkElement = item.querySelector('link');
    const postLink = postLinkElement ? postLinkElement.textContent : '';

    const postTitleElement = item.querySelector('title');
    const postTitle = postTitleElement ? postTitleElement.textContent : '';

    const postDescriptionElement = item.querySelector('description');
    const postDescription = postDescriptionElement ? postDescriptionElement.textContent : '';

    return {
      link: postLink,
      title: postTitle,
      description: postDescription,
    };
  });

  return { feed, posts };
};

export default parse;
