import React from 'react';
import PropTypes from 'prop-types';

export default function WrappedHeader(props) {
  const { id, wrapperClassName, headerClassName, headerText, renderChildren } = props;
  return (
    <div className={wrapperClassName}>
      <label className={headerClassName} htmlFor={id}>
        {headerText}
      </label>
      {renderChildren()}
    </div>
  );
}

WrappedHeader.propTypes = {
  id: PropTypes.string.isRequired,
  wrapperClassName: PropTypes.string,
  headerClassName: PropTypes.string,
  headerText: PropTypes.string,
  renderChildren: PropTypes.func.isRequired,
};

WrappedHeader.defaultProps = {
  headerText: '',
  wrapperClassName: '',
  headerClassName: '',
};
