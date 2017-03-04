
import React from 'react';
import List from '../../components/List';
import PageItem from './PageItem';

const Pages = props => (
  <List title="Pages" category="pages" path="/pages"
    Item={PageItem} select="name path" {...props} />
);

export default Pages;
