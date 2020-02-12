import React from 'react';
import PropTypes from 'prop-types';
import wrappedHeader from './wrappedheader';

function ToolBar(props) {
  const { buttonNames, activeButtonIndex, onButtonClick, subClassNames, ...toolbarProps } = props;
  function createToolButton(buttonName, index) {
    return (
      <div
        className={`tabbutton ${subClassNames}${index === activeButtonIndex ? ' pressed' : ''}`}
        onClick={event => onButtonClick(event, index)}
        onKeyPress={event => onButtonClick(event, index)}
        role="button"
        tabIndex={0}
        key={index}
      >
        {buttonName}
      </div>
    );
  }
  const listToolButtons = buttonNames.map(createToolButton);
  /* eslint-disable */
  // "Prop spreading is forbidden"
  return (
    <div {...toolbarProps}>
      {listToolButtons}
    </div>
  );
  /* eslint-enable */
}

ToolBar.propTypes = {
  buttonNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  onButtonClick: PropTypes.func.isRequired,
  activeButtonIndex: PropTypes.number.isRequired,
  subClassNames: PropTypes.string,
};

ToolBar.defaultProps = {
  subClassNames: '',
};

const ToolBarWithHeader = wrappedHeader(ToolBar);

export default ToolBarWithHeader;
