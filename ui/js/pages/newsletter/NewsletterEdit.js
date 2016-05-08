"use strict";
import Edit from '../../components/Edit';
import NewsletterFormContents from './NewsletterFormContents';

export default class NewsletterEdit extends Edit {};

NewsletterEdit.defaultProps = {
  category: 'newsletters',
  FormContents: NewsletterFormContents,
  title: 'Edit Newsletter'
};
