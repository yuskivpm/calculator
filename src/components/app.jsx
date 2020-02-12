import React from 'react';
import InfoCard from './infocard';
import CalcBody from './calc';
import dataProviderApi from '../api/dataProviderApi';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    dataProviderApi.fetchWithPause(
      dataProviderApi.fetchInfoCard,
      userCard => this.setState(userCard),
      err =>
        this.setState({
          error: err && err.infoCardError ? err.infoCardError : 'Fail fetching info card',
        }),
      2000
    );
  }

  updateInfoCard = updateObject => {
    this.setState(updateObject);
  };

  render() {
    const { msrp } = this.state;
    /* eslint-disable */
    // "Prop spreading is forbidden"
    return (
      <>
        <CalcBody onChange={this.updateInfoCard} msrp={msrp}></CalcBody>
        <InfoCard {...this.state} />
      </>
    );
    /* eslint-enable */
  }
}
