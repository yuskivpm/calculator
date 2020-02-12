import React from 'react';
import PropTypes from 'prop-types';
import wrappedHeader from './wrappedheader';

function SmartInput(props) {
  const { id, maskStart, maskEnd, ...inputProps } = props;
  /* eslint-disable */
  // "Prop spreading is forbidden"
  return (
    <div className="extendedinput">
      {maskStart && (
        <span className="maskStart" htmlFor={id}>
          {maskStart}
        </span>
      )}
      <input id={id} {...inputProps} />
      {maskEnd && (
        <span className="maskEnd" htmlFor={id}>
          {maskEnd}
        </span>
      )}
    </div>
  );
  /* eslint-enable */
}

SmartInput.propTypes = {
  id: PropTypes.string.isRequired,
  maskStart: PropTypes.string,
  maskEnd: PropTypes.string,
  type: PropTypes.string,
};

SmartInput.defaultProps = {
  type: 'text',
  maskStart: '',
  maskEnd: '',
};

const SmartInputWithHeader = wrappedHeader(SmartInput);

export default SmartInputWithHeader;
