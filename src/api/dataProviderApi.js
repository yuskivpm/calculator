export default class dataProvider {
  static fetchInfoCard() {
    return {
      msrp: '20000.00',
      vehicleName: 'Hyundai Santa Fe 2019',
      dealerName: 'Ivan Vaschuk',
      dealerPhone: '(800) 800-8008',
      dealerRating: '80',
      currency: '$',
    };
  }

  static fetchCalcDefaults() {
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
    const taxesValue =
      postcode &&
      postcode
        .split('')
        .map(num => (Number.isNaN(+num) ? '' : num * 11))
        .filter(el => el !== '')
        .join('');
    onChange({ taxes: taxesValue });
  };

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

  static promiseForMe(promiseThat, resolveFunc, rejectFunc) {
    return Promise.resolve(promiseThat())
      .then(resolveFunc)
      .catch(rejectFunc);
  }

  static debounce = (callback, delay = 500) => {
    let timerId;
    return (...args) => {
      if (timerId) {
        clearTimeout(timerId);
      }
      timerId = setTimeout(() => {
        callback(...args);
      }, delay);
    };
  };

  static getPayment = (paymentValue = 0, currency = '') =>
    !Number.isNaN(+paymentValue) && paymentValue >= 0.01
      ? `${currency}${paymentValue.toFixed(2)}`
      : '';
}
