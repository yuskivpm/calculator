import React from 'react';
import PropTypes from 'prop-types';
import WrappedHeader from './wrappedheader';

export default class SmartInput extends React.Component {
  smartInputNode = () => {
    const {
      id,
      name,
      placeholder,
      defvalue,
      maskStart,
      maskEnd,
      onChange,
      max,
      min,
      pattern,
      inputType,
    } = this.props;
    return (
      <div className="extendedinput">
        {maskStart && (
          <span className="maskStart" htmlFor={id}>
            {maskStart}
          </span>
        )}
        <input
          type={inputType}
          value={defvalue}
          name={name}
          id={id}
          placeholder={placeholder}
          onChange={onChange}
          pattern={pattern}
          max={max}
          min={min}
        />
        {maskEnd && (
          <span className="maskEnd" htmlFor={id}>
            {maskEnd}
          </span>
        )}
      </div>
    );
  };

  render() {
    const { id, text } = this.props;
    return (
      <WrappedHeader
        id={id}
        wrapperClassName="inputField"
        headerClassName="inputFieldLabel"
        headerText={text}
        renderChildren={this.smartInputNode}
      />
    );
  }
}

SmartInput.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  defvalue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  maskStart: PropTypes.string,
  maskEnd: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  pattern: PropTypes.string,
  inputType: PropTypes.string,
  max: PropTypes.string,
  min: PropTypes.string,
};

SmartInput.defaultProps = {
  inputType: 'text',
  placeholder: '',
  maskStart: '',
  maskEnd: '',
  defvalue: '',
  pattern: '.*',
  max: '',
  min: '',
};
