import './FieldsPage.scss';
import Component from 'react-pure-render/component';
import DynamicField from './DynamicField.react.js';
import FieldError from '../lib/FieldError.react';
import Helmet from 'react-helmet';
import React, { PropTypes } from 'react';
import buttonsMessages from '../../common/app/buttonsMessages';
import linksMessages from '../../common/app/linksMessages';
import { FormattedMessage, defineMessages } from 'react-intl';
import { connect } from 'react-redux';
import { fields } from '../../common/lib/redux-fields';
import { focusInvalidField, ValidationError } from '../../common/lib/validation';

const messages = defineMessages({
  h2: {
    defaultMessage: 'Fields',
    id: 'fields.page.h2'
  },
  p: {
    defaultMessage: 'Something like redux-form but simplified and universal.',
    id: 'fields.page.p'
  }
});

// Just an example of some dynamically loaded data.
// cato.org/publications/commentary/key-concepts-libertarianism
const keyConceptsOfLibertarianism = [
  'Individualism',
  'Individual Rights',
  'Spontaneous Order',
  'The Rule of Law',
  'Limited Government',
  'Free Markets',
  'The Virtue of Production',
  'Natural Harmony of Interests',
  'Peace',
].map((concept, index) => ({
  id: index,
  name: concept,
}));

// Use Redux action for real usage.
const exampleAction = async (values) => new Promise((resolve, reject) => {
  if (values.someField.trim()) {
    setTimeout(resolve, 1000);
    return;
  }
  setTimeout(() => {
    reject({
      reason: new ValidationError('required', { prop: 'someField' })
    });
  }, 1000);
});

class FieldsPage extends Component {

  static propTypes = {
    // Generated fields by fields higher order component.
    fields: PropTypes.object.isRequired,
    // We can read anything from fields model directly.
    fieldsPageModel: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.state = {
      disabled: false,
      error: null,
    };
  }

  async onFormSubmit(e) {
    e.preventDefault();
    const { fields } = this.props;

    this.setState({ disabled: true });
    // For simple flat forms we can use handy fields.$values() helper.
    const values = fields.$values();
    // console.log(values); // eslint-disable-line no-console
    // For complex nested forms we can get whole model via Redux connect.
    // const allValues = this.propsfieldsPageModel && this.propsfieldsPageModel.toJS();
    // console.log(allValues); // eslint-disable-line no-console

    try {
      await exampleAction(values);
    } catch (error) {
      const { reason } = error;
      if (reason instanceof ValidationError) {
        this.setState({ error: reason }, () => {
          setTimeout(() => {
            focusInvalidField(this, reason);
          }, 0);
        });
        return;
      }
      throw error;
    } finally {
      this.setState({ disabled: false });
    }

    // Reset all (even nested) fieldsPage fields.
    fields.$reset();
  }

  render() {
    const { fields, fieldsPageModel } = this.props;
    const { disabled, error } = this.state;

    return (
      <div className="fields-page">
        <FormattedMessage {...linksMessages.fields}>
          {message => <Helmet title={message} />}
        </FormattedMessage>
        <h2>
          <FormattedMessage {...messages.h2} />
        </h2>
        <p>
          <FormattedMessage {...messages.p} />
        </p>
        <form onSubmit={this.onFormSubmit}>
          <fieldset disabled={disabled}>
            <h3>Some Field</h3>
            <input
              {...fields.someField}
              maxLength={100}
              type="text"
            />
            <FieldError error={error} prop="someField" />
            <h3>Dynamic Fields</h3>
            <div>
              {keyConceptsOfLibertarianism.map(concept =>
                <DynamicField item={concept} key={concept.id} />
              )}
            </div>
            <h3>Checkboxes</h3>
            <label>
              <input
                {...fields.hasCar}
                checked={fields.hasCar.value}
                type="checkbox"
              /> Has Car
            </label>
            <label>
              <input
                {...fields.hasBike}
                checked={fields.hasBike.value}
                type="checkbox"
              /> Has Bike
            </label>
            <h3>Radios</h3>
            <label>
              <input
                {...fields.gender}
                checked={fields.gender.value === 'male'}
                type="radio"
                value="male"
              /> Male
            </label>
            <label>
              <input
                {...fields.gender}
                checked={fields.gender.value === 'female'}
                type="radio"
                value="female"
              /> Female
            </label>
            <label>
              <input
                {...fields.gender}
                checked={fields.gender.value === 'other'}
                type="radio"
                value="other"
              /> Other
            </label>
            <h3>Select</h3>
            <select {...fields.selectedNumber}>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
            {/*
              Why no multiple select? Because users are not familiar with that.
              Use checkboxes or custom checkable dynamic fields instead.
            */}
            <div>
              <button type="submit">
                <FormattedMessage {...buttonsMessages.submit} />
              </button>
            </div>
            <pre>
              {fieldsPageModel &&
                JSON.stringify(fieldsPageModel.toJS(), null, 2)
              }
            </pre>
          </fieldset>
        </form>
      </div>
    );
  }

}

FieldsPage = fields(FieldsPage, {
  path: 'fieldsPage',
  fields: [
    'someField',
    'hasCar',
    'hasBike',
    'gender',
    'selectedNumber'
  ],
  getInitialState: () => ({
    // someField: '123',
    // hasCar: true,
    gender: 'male',
    selectedNumber: '2'
  })
});

// Connect is not required. It's just a demonstration of fields state.
export default connect(state => ({
  fieldsPageModel: state.fields.get('fieldsPage')
}))(FieldsPage);
