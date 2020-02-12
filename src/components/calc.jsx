import React from 'react';
import PropTypes from 'prop-types';
import dataProviderApi from '../api/dataProviderApi';
import ToolBar from './toolbar';
import SmartInput from './smartinput';
import SmartSelect from './smartselect';
import Spinner from './spinner';
import './calc.scss';

const DEBOUNCE_DELAY = 300;
const calcDefaultStorageName = 'calcDefaults';
const REGEXP_NUMBERS_ONLY = '^[0-9]+(?:[.][0-9]{1,2})?$';
const emptyFunc = () => null;

export default class CalcBody extends React.Component {
  constructor(props) {
    super(props);
    this.deferredCalculation = dataProviderApi.debounce(() => {
      dataProviderApi.promiseForMe(() => this.recalculatePayment(this.state));
    }, DEBOUNCE_DELAY);
    this.state = {};
  }

  componentDidMount() {
    if (!this.isStoredInfoCardLoaded()) {
      this.loadDefaultInfoCard();
    }
    this.loadPostCode();
  }

  componentDidUpdate() {
    const { recalculate } = this.state;
    if (recalculate) {
      this.state.recalculate = false;
      this.saveToStorage();
      this.deferredCalculation();
    }
  }

  onToolButtonClick = (event, index) => {
    const indexAttribute = event.target.parentElement.getAttribute('index');
    if (indexAttribute) {
      this.setState({ [indexAttribute]: index });
      if (indexAttribute === 'activePageIndex') {
        // on Loan/Lease page change - set to App size of alculated payment for saving in infoCard
        const { payment, postcodeLoan, postcodeLease } = this.state;
        this.sendPayment(payment[index]);
        this.calculateTaxes(index === 0 ? postcodeLoan : postcodeLease);
      } else {
        this.state.recalculate = true;
      }
    }
  };

  onInputChange = event => {
    const name = event.target.getAttribute('name');
    const { value } = event.target;
    if (event.target.tagName === 'SELECT') {
      const { [`${name}Array`]: array } = this.state;
      const valueAsIndex = array.findIndex(el => el === value);
      this.setState({ [name]: valueAsIndex });
    } else {
      this.setState({ [name]: value });
      if (name.startsWith('postcode')) {
        this.calculateTaxes(value);
        return;
      }
    }
    this.state.recalculate = true;
  };

  generateErrorDiv = errArray =>
    errArray.length > 0 && (
      <div className="errorMessage">
        {errArray.map(el => (
          <p key={`err${el[0]}`}>{el.substr(1)}</p>
        ))}
      </div>
    );

  validateData = () => {
    const errorText = [];
    const { activePageIndex, tradein, downpayment, apr, msrp } = this.state;
    const quarterMsrp = msrp / 4;
    if (Number.isNaN(+downpayment) || downpayment < 0 || downpayment > quarterMsrp) {
      errorText.push('1Down Payment should be within [0 - 1/4] of MSRP');
    }
    if (Number.isNaN(+tradein) || tradein < 0 || tradein > quarterMsrp) {
      errorText.push('2Trade-In should be within [0 - 1/4] of MSRP');
    }
    if (activePageIndex === 0 && (Number.isNaN(+apr) || apr <= 0)) {
      errorText.push('3APR should be greater than 0');
    }
    return errorText;
  };

  isStoredInfoCardLoaded = () => {
    const storedData = sessionStorage.getItem(calcDefaultStorageName);
    if (storedData) {
      const newState = JSON.parse(storedData);
      this.setState({ ...newState, infoCardError: '', recalculate: true });
      return true;
    }
    return false;
  };

  loadDefaultInfoCard = () => {
    // Load default values. The pause timer is used solely to demonstrate the spinner.
    dataProviderApi.fetchWithPause(
      // normally used - promiseForMe () instead of fetchWithPause
      dataProviderApi.fetchCalcDefaults,
      calcDefaults => {
        this.setState(calcDefaults);
        this.state.recalculate = true;
      },
      err =>
        this.setState({
          infoCardError:
            err && err.infoCardError ? err.infoCardError : '0Fail fetching calc defaults',
        })
    );
  };

  loadPostCode = () => {
    const { postcodeLoan, postcodeLease } = this.state;
    if (!postcodeLoan || !postcodeLease) {
      dataProviderApi.promiseForMe(dataProviderApi.fetchPostCode, receivedPostCode => {
        const {
          postcodeLoan: postcodeLoanLocal,
          postcodeLease: postcodeLeaseLocal,
          activePageIndex,
        } = this.state;
        if (receivedPostCode && (!postcodeLoanLocal || !postcodeLeaseLocal)) {
          const newState = {};
          if (!postcodeLoanLocal) {
            newState.postcodeLoan = receivedPostCode;
          }
          if (!postcodeLeaseLocal) {
            newState.postcodeLease = receivedPostCode;
          }
          this.setState(newState);
          this.calculateTaxes(
            activePageIndex === 0 ? newState.postcodeLoan : newState.postcodeLease
          );
        } else {
          this.calculateTaxes(activePageIndex === 0 ? postcodeLoanLocal : postcodeLeaseLocal);
        }
      });
    }
  };

  calculateTaxes = postcode => {
    const { onChange } = this.props;
    onChange({ taxes: null });
    dataProviderApi.fetchWithPause(
      () => dataProviderApi.fetchTaxes(postcode, onChange),
      emptyFunc,
      emptyFunc,
      DEBOUNCE_DELAY
    );
  };

  recalculatePayment = realState => {
    this.state.recalculate = false;
    const errorArray = this.validateData();
    if (errorArray.length) {
      return;
    }
    // send empty payment to draw spiner
    this.sendPayment(null);
    const prepareCalculationData = JSON.stringify(realState);
    dataProviderApi.fetchWithPause(
      () => dataProviderApi.calculatePayment(prepareCalculationData),
      newPaymentAsArray => {
        this.setState({ payment: newPaymentAsArray });
        this.sendPayment();
      },
      emptyFunc,
      DEBOUNCE_DELAY
    );
  };

  sendPayment = (paymentValue = undefined) => {
    const { activePageIndex, payment } = this.state;
    const { onChange } = this.props;
    onChange({ payment: paymentValue === undefined ? payment[activePageIndex] : paymentValue });
  };

  saveToStorage = () => sessionStorage.setItem(calcDefaultStorageName, JSON.stringify(this.state));

  render() {
    const { isLoaded, infoCardError } = this.state;
    let calculationError;
    const errorDiv =
      infoCardError && infoCardError.length > 0 && this.generateErrorDiv([infoCardError]);
    let mainBody;
    const { msrp: propsMsrp } = this.props;
    if (!isLoaded || !propsMsrp) {
      mainBody = <Spinner />;
    } else {
      const {
        payment,
        currency = '$',
        msrp: stateMsrp,
        // loan=0, Lease=1
        activePageIndex,
        // shared loan&lease
        tradein,
        downpayment,
        activeCreditScoreIndex,
        activeCreditScoreIndexArray,
        // loan
        postcodeLoan = '',
        postcodeLease = '',
        activeLoanTermIndex,
        activeLoanTermIndexArray,
        apr,
        // lease
        activeLeaseTermIndex,
        activeLeaseTermIndexArray,
        activeMileagesIndex,
        activeMileagesIndexArray,
      } = this.state;
      if (!stateMsrp && propsMsrp) {
        this.state.msrp = propsMsrp;
      }
      const { msrp } = this.state;
      calculationError = this.generateErrorDiv(this.validateData());
      const quarterMsrp = `${msrp / 4}`;
      mainBody = (
        <div className="calc">
          <ToolBar
            buttonNames={[
              `Loan ${dataProviderApi.getPayment(payment[0], currency)}`,
              `Lease ${dataProviderApi.getPayment(payment[1], currency)}`,
            ]}
            activeButtonIndex={activePageIndex}
            onButtonClick={this.onToolButtonClick}
            className="toolbar"
            subClassNames="pageview"
            index="activePageIndex"
            wrapperClassName=""
          />
          <div className={`mainbody loan${activePageIndex !== 0 ? ' hidden' : ''}`}>
            <div className="column">
              <SmartInput
                id="postcodeloan"
                name="postcodeLoan"
                headerText="Post Code"
                placeholder="Enter post code"
                value={postcodeLoan}
                onChange={this.onInputChange}
              />
              <SmartInput
                id="tradeinloan"
                name="tradein"
                headerText="Trade-In"
                placeholder="Trade-In value"
                value={tradein}
                maskStart={currency}
                onChange={this.onInputChange}
                type="number"
                pattern={REGEXP_NUMBERS_ONLY}
                max={quarterMsrp}
                min="0"
              />
              <SmartInput
                id="downpaymentloan"
                name="downpayment"
                headerText="Down Payment"
                placeholder="Down payment"
                value={downpayment}
                maskStart={currency}
                onChange={this.onInputChange}
                type="number"
                pattern={REGEXP_NUMBERS_ONLY}
                max={quarterMsrp}
                min="0"
              />
              <SmartInput
                id="apr"
                name="apr"
                headerText="APR"
                placeholder="APR"
                value={apr}
                maskEnd="%"
                onChange={this.onInputChange}
                type="number"
                pattern={REGEXP_NUMBERS_ONLY}
                min="0"
              />
              <ToolBar
                buttonNames={activeLoanTermIndexArray}
                activeButtonIndex={activeLoanTermIndex}
                onButtonClick={this.onToolButtonClick}
                id="termsloan"
                index="activeLoanTermIndex"
                className="toolbar"
                headerText="Terms"
                wrapperClassName=""
                headerClassName=""
              />
              <ToolBar
                buttonNames={activeCreditScoreIndexArray}
                activeButtonIndex={activeCreditScoreIndex}
                onButtonClick={this.onToolButtonClick}
                id="creditscoreloan"
                index="activeCreditScoreIndex"
                className="toolbar"
                headerText="Credit Score"
                wrapperClassName=""
                headerClassName=""
              />
            </div>
          </div>
          <div className={`mainbody lease${activePageIndex !== 1 ? ' hidden' : ''}`}>
            <div className="column">
              <SmartInput
                id="postcodelease"
                name="postcodeLease"
                headerText="Post Code"
                placeholder="Enter post code"
                value={postcodeLease}
                onChange={this.onInputChange}
              />
              <SmartInput
                id="tradeinlease"
                name="tradein"
                headerText="Trade-In"
                placeholder="Trade-In value"
                value={tradein}
                maskStart={currency}
                onChange={this.onInputChange}
                type="number"
                pattern={REGEXP_NUMBERS_ONLY}
                max={quarterMsrp}
                min="0"
              />
              <SmartInput
                id="downpaymentlease"
                name="downpayment"
                headerText="Down Payment"
                placeholder="Down payment"
                value={downpayment}
                maskStart={currency}
                onChange={this.onInputChange}
                type="number"
                pattern={REGEXP_NUMBERS_ONLY}
                max={quarterMsrp}
                min="0"
              />
            </div>
            <div className="column">
              <SmartSelect
                id="Terms"
                headerText="Terms"
                values={activeLeaseTermIndexArray}
                name="activeLeaseTermIndex"
                activeOption={activeLeaseTermIndex}
                onChange={this.onInputChange}
              />
              <SmartSelect
                id="Mileages"
                headerText="Mileages"
                values={activeMileagesIndexArray}
                name="activeMileagesIndex"
                activeOption={activeMileagesIndex}
                onChange={this.onInputChange}
              />
              <SmartSelect
                id="creditscore"
                headerText="Credit Score"
                values={activeCreditScoreIndexArray}
                name="activeCreditScoreIndex"
                activeOption={activeCreditScoreIndex}
                onChange={this.onInputChange}
              />
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="calc">
        {mainBody}
        {calculationError}
        {errorDiv}
      </div>
    );
  }
}

CalcBody.propTypes = {
  onChange: PropTypes.func.isRequired,
  msrp: PropTypes.number,
};

CalcBody.defaultProps = {
  msrp: 0,
};
