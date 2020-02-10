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
const compareFloat = (first, second) => Math.trunc(first * 100) === Math.trunc(second * 100);
const isEqualArrays = (first, second) =>
  first.every((el, index) => compareFloat(el, second[index]));

export default class CalcBody extends React.Component {
  constructor(props) {
    super(props);
    const storedData = sessionStorage.getItem(calcDefaultStorageName);
    this.deferredCalculation = dataProviderApi.debounce(
      () => dataProviderApi.promiseForMe(() => this.recalculatePayment(this.state)),
      DEBOUNCE_DELAY
    );
    if (storedData) {
      this.state = JSON.parse(storedData);
      this.state.errorMessage = '';
      this.state.infoCardError = '';
    } else {
      this.state = {};
    }
  }

  componentDidMount() {
    const { postcodeLoan, postcodeLease, isLoaded } = this.state;
    if (!postcodeLoan || !postcodeLease) {
      dataProviderApi.promiseForMe(dataProviderApi.fetchPostCode, receivedPostCode => {
        const { postcodeLoan: postcodeLoanLocal, postcodeLease: postcodeLeaseLocal } = this.state;
        if (receivedPostCode && (!postcodeLoanLocal || !postcodeLeaseLocal)) {
          const newState = {};
          if (!postcodeLoanLocal) {
            newState.postcodeLoanLocal = receivedPostCode;
          }
          if (!postcodeLeaseLocal) {
            newState.postcodeLeaseLocal = receivedPostCode;
          }
          this.setState(newState);
        }
      });
    }
    if (!isLoaded) {
      setTimeout(() => {
        dataProviderApi.promiseForMe(
          dataProviderApi.fetchCalcDefaults,
          calcDefaults => {
            this.setState(calcDefaults);
            this.sendUpdatesToParent();
          },
          err =>
            this.setState({
              infoCardError:
                err && err.infoCardError ? err.infoCardError : '0Fail fetching calc defaults',
            })
        );
      }, 2000);
    } else {
      this.sendUpdatesToParent();
    }
  }

  componentDidUpdate() {
    this.deferredCalculation();
  }

  recalculatePayment = realState => {
    const errorArray = this.validateData();
    if (errorArray.length) {
      return;
    }
    const {
      msrp = -1,
      payment,
      // loan=0, Lease=1
      activePageIndex,
      // shared loan&lease
      tradein,
      downpayment,
      activeCreditScoreIndex,
      activeCreditScoreIndexArray,
      creditScoreValue,
      // loan
      activeLoanTermIndex,
      activeLoanTermIndexArray,
      apr,
      // lease
      activeLeaseTermIndex,
      activeLeaseTermIndexArray,
      activeMileagesIndex,
      activeMileagesIndexArray,
    } = realState;
    const currentCreditScore = activeCreditScoreIndexArray[activeCreditScoreIndex];
    const realCreditScoreValue = creditScoreValue.find(
      ({ minScore }) => minScore <= currentCreditScore
    ).creditScoreValue;
    // - monthly payment loan: ```(msrp - tradeIn - downPayment) * / term * creditScoreValue * apr```
    const loan =
      (((msrp - tradein - downpayment) / activeLoanTermIndexArray[activeLoanTermIndex]) *
        realCreditScoreValue *
        apr) /
      100;
    // - monthly payment lease: ```(msrp - tradeIn - downPayment) * mileage / 10000 / term * creditScoreValue```
    const lease =
      (((msrp - tradein - downpayment) * activeMileagesIndexArray[activeMileagesIndex]) /
        10000 /
        activeLeaseTermIndexArray[activeLeaseTermIndex]) *
      realCreditScoreValue;
    const newPayment = [loan, lease];
    if (!isEqualArrays(payment, newPayment)) {
      this.setState({ payment: newPayment });
      const { onChange } = this.props;
      onChange({ payment: newPayment[activePageIndex] });
    }
  };

  saveToStorage = () => sessionStorage.setItem(calcDefaultStorageName, JSON.stringify(this.state));

  calculateTaxes = postcode => {
    const { onChange } = this.props;
    dataProviderApi.promiseForMe(() => dataProviderApi.fetchTaxes(postcode, onChange));
  };

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
    if (activePageIndex === 0 && (Number.isNaN(+apr) || apr < 0)) {
      errorText.push('3APR can not be less than 0');
    }
    return errorText;
  };

  sendUpdatesToParent = () => {
    const { activePageIndex, payment, postcodeLoan, postcodeLease } = this.state;
    const { onChange } = this.props;
    onChange({
      payment: payment[activePageIndex],
    });
    this.calculateTaxes(activePageIndex === 0 ? postcodeLoan : postcodeLease);
  };

  onToolButtonClick = (event, index) => {
    const indexAttribute = event.target.parentElement.getAttribute('index');
    if (indexAttribute) {
      this.setState({ [indexAttribute]: index });
      if (indexAttribute === 'activePageIndex') {
        // on Loan/Lease page change - set to App size of alculated payment for saving in infoCard
        const { payment, postcodeLoan, postcodeLease } = this.state;
        const { onChange } = this.props;
        onChange({ payment: payment[index] });
        this.calculateTaxes(index === 0 ? postcodeLoan : postcodeLease);
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
      }
    }
  };

  generateErrorDiv = errArray =>
    errArray.length > 0 && (
      <div className="errorMessage">
        {errArray.map(el => (
          <p key={`err${el[0]}`}>{el.substr(1)}</p>
        ))}
      </div>
    );

  render() {
    const {
      isLoaded,
      infoCardError,
      payment,
      currency = '$',
      msrp,
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
    const quarterMsrp = msrp / 4;
    const { msrp: propsMsrp } = this.props;
    let calculationError;
    const errorDiv =
      infoCardError && infoCardError.length > 0 && this.generateErrorDiv([infoCardError]);
    let children;
    if (!isLoaded || !propsMsrp) {
      children = <Spinner />;
    } else {
      calculationError = this.generateErrorDiv(this.validateData());
      const { msrp: stateMsrp } = this.state;
      if (!stateMsrp && propsMsrp) {
        this.state.msrp = propsMsrp;
      }
      this.saveToStorage();
      children = (
        <div className="calc">
          <ToolBar
            buttonNames={[
              `Loan ${dataProviderApi.getPayment(payment[0], currency)}`,
              `Lease ${dataProviderApi.getPayment(payment[1], currency)}`,
            ]}
            activeButtonIndex={activePageIndex}
            onButtonClick={this.onToolButtonClick}
            toolBarClassname="toolbar"
            subClassNames="pageview"
            indexAttribute="activePageIndex"
          />
          <div className={`mainbody loan${activePageIndex !== 0 ? ' hidden' : ''}`}>
            <div className="column">
              <SmartInput
                id="postcodeloan"
                name="postcodeLoan"
                text="Post Code"
                placeholder="Enter post code"
                defvalue={postcodeLoan}
                onChange={this.onInputChange}
              />
              <SmartInput
                id="tradeinloan"
                name="tradein"
                text="Trade-In"
                placeholder="Trade-In value"
                defvalue={tradein}
                maskStart={currency}
                onChange={this.onInputChange}
                inputType="number"
                pattern={REGEXP_NUMBERS_ONLY}
                max={quarterMsrp}
              />
              <SmartInput
                id="downpaymentloan"
                name="downpayment"
                text="Down Payment"
                placeholder="Down payment"
                defvalue={downpayment}
                maskStart={currency}
                onChange={this.onInputChange}
                inputType="number"
                pattern={REGEXP_NUMBERS_ONLY}
                max={quarterMsrp}
              />
              <SmartInput
                id="apr"
                name="apr"
                text="APR"
                placeholder="APR"
                defvalue={apr}
                maskEnd="%"
                onChange={this.onInputChange}
                inputType="number"
                pattern={REGEXP_NUMBERS_ONLY}
              />
              <ToolBar
                buttonNames={activeLoanTermIndexArray}
                activeButtonIndex={activeLoanTermIndex}
                onButtonClick={this.onToolButtonClick}
                id="termsloan"
                indexAttribute="activeLoanTermIndex"
                toolBarClassname="toolbar"
                headerText="Terms"
              />
              <ToolBar
                buttonNames={activeCreditScoreIndexArray}
                activeButtonIndex={activeCreditScoreIndex}
                onButtonClick={this.onToolButtonClick}
                id="creditscoreloan"
                indexAttribute="activeCreditScoreIndex"
                toolBarClassname="toolbar"
                headerText="Credit Score"
              />
            </div>
          </div>
          <div className={`mainbody lease${activePageIndex !== 1 ? ' hidden' : ''}`}>
            <div className="column">
              <SmartInput
                id="postcodelease"
                name="postcodeLease"
                text="Post Code"
                placeholder="Enter post code"
                defvalue={postcodeLease}
                onChange={this.onInputChange}
              />
              <SmartInput
                id="tradeinlease"
                name="tradein"
                text="Trade-In"
                placeholder="Trade-In value"
                defvalue={tradein}
                maskStart={currency}
                onChange={this.onInputChange}
                inputType="number"
                pattern={REGEXP_NUMBERS_ONLY}
                max={quarterMsrp}
              />
              <SmartInput
                id="downpaymentlease"
                name="downpayment"
                text="Down Payment"
                placeholder="Down payment"
                defvalue={downpayment}
                maskStart={currency}
                onChange={this.onInputChange}
                inputType="number"
                pattern={REGEXP_NUMBERS_ONLY}
                max={quarterMsrp}
              />
            </div>
            <div className="column">
              <SmartSelect
                id="Terms"
                text="Terms"
                values={activeLeaseTermIndexArray}
                name="activeLeaseTermIndex"
                activeOption={activeLeaseTermIndex}
                onChange={this.onInputChange}
              />
              <SmartSelect
                id="Mileages"
                text="Mileages"
                values={activeMileagesIndexArray}
                name="activeMileagesIndex"
                activeOption={activeMileagesIndex}
                onChange={this.onInputChange}
              />
              <SmartSelect
                id="creditscore"
                text="Credit Score"
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
        {children}
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
