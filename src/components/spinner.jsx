import React from 'react';
import PropTypes from 'prop-types';
import './spinner.scss';

export default function Spinner(props) {
  const { children, className } = props;
  if (children) {
    return <span className={className}>{children}</span>;
  }
  return <span className={`spinner ${className}`}>&nbsp;</span>;
}

Spinner.propTypes = {
  children: PropTypes.string,
  className: PropTypes.string,
};

Spinner.defaultProps = {
  children: '',
  className: '',
};
