
import Edit from '../../components/Edit';
import PageFormContents from './PageFormContents';
import PagePreview from './PagePreview';

export default class PageEdit extends Edit {}

PageEdit.defaultProps = {
  ...Edit.defaultProps,
  category: 'pages',
  FormContents: PageFormContents,
  Preview: PagePreview,
  title: 'Edit Page',
};
