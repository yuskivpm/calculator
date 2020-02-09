import React from 'react';
import { setTimeout } from 'core-js';
import InfoCard from './infocard';
import CalcBody from './calc';
import dataProviderApi from '../api/dataProviderApi';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    // Just a pause to test the spinner
    setTimeout(() => {
      dataProviderApi.promiseForMe(
        dataProviderApi.fetchInfoCard,
        userCard => this.setState(userCard),
        err =>
          this.setState({
            infoCardError: err && err.infoCardError ? err.infoCardError : 'Fail fetching info card',
          })
      );
    }, 2000);
  }

  updateInfoCard = updateObject => {
    this.setState(updateObject);
  };

  render() {
    const {
      msrp,
      vehicleName,
      dealerName,
      dealerPhone,
      dealerRating,
      taxes,
      payment,
      infoCardError,
      currency,
    } = this.state;
    return (
      <React.Fragment key="app">
        <CalcBody onChange={this.updateInfoCard} msrp={parseFloat(msrp)} />
        <InfoCard
          msrp={parseFloat(msrp)}
          vehicleName={vehicleName}
          dealerName={dealerName}
          dealerPhone={dealerPhone}
          dealerRating={dealerRating}
          taxes={taxes}
          payment={payment}
          error={infoCardError}
          currency={currency}
        />
      </React.Fragment>
    );
  }
}
