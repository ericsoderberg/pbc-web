
import React, { PropTypes } from 'react';
import PageHeader from '../../components/PageHeader';
import Sections from '../../components/Sections';

const PagePreview = (props) => {
  const { item } = props;
  const page = item;
  return (
    <main className="page-preview">
      <PageHeader title="Preview" />
      <Sections align={page.align} sections={page.sections} />
    </main>
  );
};

PagePreview.propTypes = {
  item: PropTypes.object.isRequired,
};

export default PagePreview;
