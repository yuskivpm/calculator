import React from 'react';
import PropTypes from 'prop-types';
import WrappedHeader from './wrappedheader';
import './toolbar.scss';

export default class ToolBar extends React.Component {
  toolBarNode = () => {
    const {
      buttonNames,
      activeButtonIndex,
      onButtonClick,
      id,
      indexAttribute,
      toolBarClassname,
      subClassNames,
    } = this.props;
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
    return (
      <div className={toolBarClassname} index={indexAttribute} id={id}>
        {listToolButtons}
      </div>
    );
  };

  render() {
    const { id, headerText } = this.props;
    if (headerText) {
      return <WrappedHeader id={id} headerText={headerText} renderChildren={this.toolBarNode} />;
    }
    return this.toolBarNode();
  }
}

ToolBar.propTypes = {
  buttonNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  onButtonClick: PropTypes.func.isRequired,
  activeButtonIndex: PropTypes.number.isRequired,
  id: PropTypes.string,
  indexAttribute: PropTypes.string,
  toolBarClassname: PropTypes.string,
  subClassNames: PropTypes.string,
  headerText: PropTypes.string,
};

ToolBar.defaultProps = {
  id: '',
  indexAttribute: '',
  toolBarClassname: '',
  subClassNames: '',
  headerText: '',
};
