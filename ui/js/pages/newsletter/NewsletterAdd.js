"use strict";
import Add from '../../components/Add';
import NewsletterFormContents from './NewsletterFormContents';

export default class NewsletterAdd extends Add {};

NewsletterAdd.defaultProps = {
  category: 'newsletters',
  FormContents: NewsletterFormContents,
  title: 'Add Newsletter'
};
