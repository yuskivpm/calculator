import React from 'react';
import PropTypes from 'prop-types';

export default function wrappedHeader(InnerComponent) {
  function WrappedHeader(props) {
    const { id, wrapperClassName, headerClassName, headerText, ...innerProps } = props;
    /* eslint-disable */
    // "Prop spreading is forbidden"
    if (headerText) {
      return (
        <div className={wrapperClassName}>
          <label className={headerClassName} htmlFor={id}>
            {headerText}
          </label>
          <InnerComponent id={id} {...innerProps} />
        </div>
      );
    }
    return <InnerComponent id={id} {...innerProps} />;
    /* eslint-enable */
  }

  WrappedHeader.propTypes = {
    id: PropTypes.string,
    wrapperClassName: PropTypes.string,
    headerClassName: PropTypes.string,
    headerText: PropTypes.string,
  };

  WrappedHeader.defaultProps = {
    id: '',
    headerText: '',
    wrapperClassName: 'inputField',
    headerClassName: 'inputFieldLabel',
  };

  return WrappedHeader;
}
