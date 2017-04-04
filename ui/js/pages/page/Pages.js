
import React from 'react';
import List from '../../components/List';
import PageItem from './PageItem';

export default props => (
  <List title="Pages" category="pages" path="/pages"
    Item={PageItem} select="name path" sort="-modified" {...props} />
);
