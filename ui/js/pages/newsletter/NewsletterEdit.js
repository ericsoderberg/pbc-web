import Edit from '../../components/Edit';
import NewsletterFormContents from './NewsletterFormContents';
import NewsletterPreview from './NewsletterPreview';

export default class NewsletterEdit extends Edit {}

NewsletterEdit.defaultProps = {
  ...Edit.defaultProps,
  category: 'newsletters',
  FormContents: NewsletterFormContents,
  postRemovePath: '/newsletters',
  Preview: NewsletterPreview,
  title: 'Edit Newsletter',
};
