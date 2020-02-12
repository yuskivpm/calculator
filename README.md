# calculator

rc_school calculator


1. Task - https://github.com/rolling-scopes-school/tasks/blob/master/tasks/calculator.md


2. Demo - https://calculatoryuskiv.netlify.com/


3. Score criteria: [Basic (70) + Normal (120) + Extra (40) - +230]

3.1. Basic scope (4 / 4)
+ Loan calculator (+20)
+ Lease calculator (+20)
+ Info card (+10)
+ Calculation logic (monthly payment and taxes are updated properly) (+20)

3.2. Normal scope (7 / 7)
+ Spinner (+10)
+ Data shares between loan and lease calculator (+20)
+ Data loads and calculations does asynchronously (result of the function that loads data about dealer and car is Promise. + result of the function that calculates taxes and monthly payment is Promise) (+10)
+ Hoc, children or render pop is used (+20)
+ Validation for Down Payment and Trade-In (validation message is shown, new calculation haven't run: monthly payment remains the same) (+40)
+ Inputs display their values with currency sign (if applicable. Ex.: trade-In, Down Payment) (+20)

3.3. Extra (additional) scope (2 / 2)
+ Keyboard support (+20)
+ Session storage (data saves to storage and restores after page reload). (+20)