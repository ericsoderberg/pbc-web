"use strict";
import Add from '../../components/Add';
import NewsletterFormContents from './NewsletterFormContents';
import NewsletterPreview from './NewsletterPreview';

export default class NewsletterAdd extends Add {};

NewsletterAdd.defaultProps = {
  category: 'newsletters',
  FormContents: NewsletterFormContents,
  Preview: NewsletterPreview,
  title: 'Add Newsletter'
};
