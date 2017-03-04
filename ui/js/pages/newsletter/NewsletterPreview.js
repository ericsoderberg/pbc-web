
import React, { PropTypes } from 'react';
import PageHeader from '../../components/PageHeader';
import NewsletterContents from './NewsletterContents';

const NewsletterPreview = (props) => {
  const { item: newsletter } = props;
  return (
    <main className="page-preview">
      <PageHeader title="Preview" />
      <NewsletterContents item={newsletter} />
    </main>
  );
};

NewsletterPreview.propTypes = {
  item: PropTypes.object.isRequired,
};

export default NewsletterPreview;
