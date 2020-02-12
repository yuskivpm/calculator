import React from 'react';
import PropTypes from 'prop-types';
import wrappedHeader from './wrappedheader';

function SmartSelect(props) {
  const createOption = (optionValue, index) => (
    <option value={optionValue} key={index}>
      {optionValue}
    </option>
  );
  const { values, activeOption, ...selectProps } = props;
  /* eslint-disable */
  // "Prop spreading is forbidden"
  return (
    <select {...selectProps} value={values[activeOption]}>
      {values.map(createOption)}
    </select>
  );
  /* eslint-enable */
}

SmartSelect.propTypes = {
  values: PropTypes.arrayOf(PropTypes.string).isRequired,
  activeOption: PropTypes.number.isRequired,
};

const SmartSelectWithHeader = wrappedHeader(SmartSelect);

export default SmartSelectWithHeader;
