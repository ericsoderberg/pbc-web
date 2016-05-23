"use strict";
import Edit from '../../components/Edit';
import NewsletterFormContents from './NewsletterFormContents';
import NewsletterPreview from './NewsletterPreview';

export default class NewsletterEdit extends Edit {};

NewsletterEdit.defaultProps = {
  category: 'newsletters',
  FormContents: NewsletterFormContents,
  Preview: NewsletterPreview,
  title: 'Edit Newsletter'
};
