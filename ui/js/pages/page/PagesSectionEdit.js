
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FormState from '../../utils/FormState';
import SectionMultiEdit from '../../components/SectionMultiEdit';
import PagesItemEdit from './PagesItemEdit';

export default class PagesSectionEdit extends Component {

  constructor(props) {
    super(props);
    const { section, onChange } = props;
    this.state = { formState: new FormState(section, onChange) };
  }

  componentWillReceiveProps(nextProps) {
    const { section, onChange } = nextProps;
    this.setState({ formState: new FormState(section, onChange) });
  }

  render() {
    const { formState } = this.state;
    return (
      <SectionMultiEdit formState={formState}
        property="pages"
        label="page"
        ItemEdit={PagesItemEdit} />
    );
  }
}

PagesSectionEdit.propTypes = {
  onChange: PropTypes.func.isRequired,
  section: PropTypes.object.isRequired,
};
