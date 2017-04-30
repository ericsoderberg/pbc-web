
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadCategory, unloadCategory } from '../../actions';
import FormField from '../../components/FormField';
import FormState from '../../utils/FormState';
import SectionEdit from '../../components/SectionEdit';

class LibrarySectionEdit extends Component {

  constructor(props) {
    super(props);
    const { section, onChange } = props;
    this.state = { formState: new FormState(section, onChange) };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(loadCategory('libraries', { sort: 'name' }));
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      formState: new FormState(nextProps.section, nextProps.onChange),
    });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch(unloadCategory('libraries'));
  }

  render() {
    const { libraries } = this.props;
    const { formState } = this.state;
    const section = formState.object;

    const options = libraries.map(library => (
      <option key={library._id} label={library.name} value={library._id} />
    ));

    let value = '';
    if (section.libraryId) {
      if (typeof section.libraryId === 'string') {
        value = section.libraryId;
      } else {
        value = section.libraryId._id;
      }
    }

    return (
      <SectionEdit formState={formState}>
        <FormField label="Library">
          <select name="libraryId" value={value}
            onChange={formState.change('libraryId')}>
            {options}
          </select>
        </FormField>
      </SectionEdit>
    );
  }
}

LibrarySectionEdit.propTypes = {
  dispatch: PropTypes.func.isRequired,
  libraries: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  section: PropTypes.object.isRequired,
};

LibrarySectionEdit.defaultProps = {
  libraries: [],
};

const select = state => ({
  libraries: (state.libraries || {}).items || [],
});

export default connect(select)(LibrarySectionEdit);
