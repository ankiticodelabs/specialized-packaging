import React from 'react';
import { Field, Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { FieldArray } from 'react-final-form-arrays';
import classNames from 'classnames';
import { FormattedMessage, useIntl } from '../../../../util/reactIntl';
import * as validators from '../../../../util/validators';
import { Button, Form, FieldTextInput } from '../../../../components';
import StartTimeInterval from '../EditListingPricingPanel/StartTimeInverval';
import css from './EditListingAboutForm.module.css';

const ErrorMessages = props => {
  const { fetchErrors } = props;
  const { updateListingError, showListingsError } = fetchErrors || {};
  return (
    <>
      {updateListingError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingAboutForm.updateFailed" />
        </p>
      ) : null}
      {showListingsError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingAboutForm.showListingFailed" />
        </p>
      ) : null}
    </>
  );
};

export const EditListingAboutForm = props => (
  <FinalForm
    mutators={{ ...arrayMutators }}
    {...props}
    render={formRenderProps => {
      const {
        formId = 'EditListingAboutForm',
        className,
        rootClassName,
        disabled,
        ready,
        handleSubmit,
        invalid,
        pristine,
        saveActionMsg,
        updated,
        updateInProgress = false,
        fetchErrors,
        values: formValues,
      } = formRenderProps;

      const intl = useIntl();
      const classes = classNames(rootClassName || css.root, className);
      const submitReady = (updated && pristine) || ready;
      const submitInProgress = updateInProgress;
      const submitDisabled = invalid || disabled || submitInProgress;

      return (
        <Form onSubmit={handleSubmit} className={classes}>
          <ErrorMessages fetchErrors={fetchErrors} />

          <h3 className={css.sectionTitle}>
            <FormattedMessage id="EditListingAboutForm.aboutSectionTitle" defaultMessage="Add About Sections" />
          </h3>

          <FieldArray name="aboutSections">
            {({ fields }) => (
              <div className={css.fieldArrayWrapper}>
                {fields.map((name, index) => (
                  <div key={name} className={css.aboutSectionBox}>
                    <h4 className={css.subTitle}>Section {index + 1}</h4>

                    <div className={css.fieldRow}>
                      <label className={css.fieldLabel}>Title</label>
                      <Field
                        name={`${name}.title`}
                        component="input"
                        type="text"
                        placeholder="Enter section title"
                        className={css.input}
                        validate={validators.required('Title is required')}
                      />
                    </div>

                    <div className={css.fieldRow}>
                      <label className={css.fieldLabel}>Description</label>
                      <FieldTextInput
                        type="textarea"
                        id={`${formId}.description_${index}`}
                        name={`${name}.description`}
                        placeholder="Enter details about this section"
                        className={css.textarea}
                        validate={validators.required('Description is required')}
                      />
                    </div>

                    <button
                      type="button"
                      className={css.removeButton}
                      onClick={() => fields.remove(index)}
                    >
                      Remove Section
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className={css.addButton}
                  onClick={() => fields.push({ title: '', description: '' })}
                >
                  + Add Another Section
                </button>
              </div>
            )}
          </FieldArray>

          <Button
            className={css.submitButton}
            type="submit"
            inProgress={submitInProgress}
            disabled={submitDisabled}
            ready={submitReady}
          >
            {saveActionMsg}
          </Button>
        </Form>
      );
    }}
  />
);

export default EditListingAboutForm;
