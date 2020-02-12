const SERVER_FETCH_DELAY_TIME = 2000;
const DEBOUNCE_DELAY_TIME = 500;

export default class dataProvider {
  static fetchWithPause(promiseThat, resolveFunc, rejectFunc, delay = SERVER_FETCH_DELAY_TIME) {
    // imitation of server fetch pause
    setTimeout(() => dataProvider.promiseForMe(promiseThat, resolveFunc, rejectFunc), delay);
  }

  static promiseForMe(promiseThat, resolveFunc, rejectFunc) {
    return Promise.resolve(promiseThat())
      .then(resolveFunc)
      .catch(rejectFunc);
  }

  static debounce(callback, delay = DEBOUNCE_DELAY_TIME) {
    let timerId;
    return (...args) => {
      if (timerId) {
        clearTimeout(timerId);
      }
      timerId = setTimeout(() => {
        callback(...args);
      }, delay);
    };
  }

  static fetchInfoCard() {
    // mock info card data
    return {
      msrp: 20000,
      vehicleName: 'Hyundai Santa Fe 2019',
      dealerName: 'Ivan Vaschuk',
      dealerPhone: '(800) 800-8008',
      dealerRating: '80',
      currency: '$',
    };
  }

  static fetchPostCode() {
    const IP_INFO = 'https://ipinfo.io/json?token=6f55930f8a909d';
    return fetch(IP_INFO)
      .then(res => {
        if (res.status !== 200) {
          return '';
        }
        return res.json().then(jsonRes => jsonRes.postal || '');
      })
      .catch(() => '');
  }

  static fetchCalcDefaults() {
    // mock calculator default data
    return {
      // loan=0, Lease=1
      activePageIndex: 1,
      // shared loan&lease
      tradein: 0,
      downpayment: 0,
      activeCreditScoreIndex: 3,
      activeCreditScoreIndexArray: ['600', '650', '700', '750', '800', '850', '900'],
      creditScoreValue: [
        { minScore: 750, creditScoreValue: 0.95 },
        { minScore: 700, creditScoreValue: 1 },
        { minScore: 640, creditScoreValue: 1.05 },
        { minScore: 0, creditScoreValue: 1.2 },
      ],
      payment: [0, 0],
      // loan
      activeLoanTermIndex: 1,
      activeLoanTermIndexArray: ['12', '24', '36', '48', '72', '84'],
      apr: 0,
      // lease
      activeLeaseTermIndex: 1,
      activeLeaseTermIndexArray: ['24', '36', '48'],
      activeMileagesIndex: 1,
      activeMileagesIndexArray: ['10000', '12000', '15000'],
      currency: '$',
      isLoaded: true,
    };
  }

  static fetchTaxes = (postcode, onChange) => {
    // imitation of the server-side taxes calculation
    const taxesValue =
      postcode &&
      postcode
        .split('')
        .map(num => (Number.isNaN(+num) ? '' : num * 11))
        .filter(el => el !== '')
        .join('');
    onChange({ taxes: taxesValue });
  };

  static calculatePayment(preparedData) {
    // imitation of the server-side monthly payment calculation
    const stateObject = JSON.parse(preparedData);
    const {
      msrp = -1,
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
    } = stateObject;
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
    return [loan, lease];
  }

  // just helper function
  static getPayment = (paymentValue = 0, currency = '') =>
    paymentValue === null || paymentValue === undefined
      ? ''
      : `${currency}${(+paymentValue).toFixed(2)}`;
}
