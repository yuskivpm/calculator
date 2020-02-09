import React from 'react';
import PropTypes from 'prop-types';
import dataProviderApi from '../api/dataProviderApi';
import Spinner from './spinner';
import Rating from './rating';
import './infocard.scss';

export default function InfoCard(props) {
  const {
    msrp,
    vehicleName,
    payment,
    taxes,
    dealerName,
    dealerPhone,
    dealerRating,
    currency,
    error,
  } = props;
  let children;
  if (error) {
    children = <h1 className="error">{error}</h1>;
  } else if (!msrp) {
    children = <Spinner />;
  } else {
    const rndId = `id${Math.trunc(Math.random() * 1000000) + 1}`;
    children = (
      <React.Fragment key="InfoCard">
        <p className="msrp">
          MSRP
          <span>{dataProviderApi.getPayment(msrp, currency)}</span>
        </p>
        <p className="vehicle">{vehicleName}</p>
        <hr />
        <p className="payment">
          Monthly payment
          <span>{dataProviderApi.getPayment(payment, currency)}</span>
        </p>
        <p className="taxes">
          Taxes
          <span>{taxes}</span>
        </p>
        <hr />
        <p className="dealername">{dealerName}</p>
        <p className="dealerphone">
          &#9742;&nbsp;
          {dealerPhone}
        </p>
        <p className="dealerrating">
          <Rating rate={dealerRating} id={rndId} />
        </p>
      </React.Fragment>
    );
  }
  return <div className="infoCard">{children}</div>;
}

InfoCard.propTypes = {
  msrp: PropTypes.number,
  vehicleName: PropTypes.string,
  payment: PropTypes.number,
  taxes: PropTypes.string,
  dealerName: PropTypes.string,
  dealerPhone: PropTypes.string,
  dealerRating: PropTypes.string,
  currency: PropTypes.string,
  error: PropTypes.string,
};

InfoCard.defaultProps = {
  msrp: 0,
  vehicleName: '',
  payment: 0,
  taxes: '',
  dealerName: '',
  dealerPhone: '',
  dealerRating: '0',
  currency: '$',
  error: '',
};
