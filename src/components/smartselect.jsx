import React from 'react';
import PropTypes from 'prop-types';
import WrappedHeader from './wrappedheader';

export default class SmartSelect extends React.Component {
  createOption = (optionValue, index) => (
    <option value={optionValue} key={index}>
      {optionValue}
    </option>
  );

  smartSelectNode = () => {
    const { id, name, values, activeOption, onChange } = this.props;
    return (
      <select id={id} onChange={onChange} value={values[activeOption]} name={name}>
        {values.map(this.createOption)}
      </select>
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
        renderChildren={this.smartSelectNode}
      />
    );
  }
}

SmartSelect.propTypes = {
  id: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  values: PropTypes.arrayOf(PropTypes.string).isRequired,
  activeOption: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};
