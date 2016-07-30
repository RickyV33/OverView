# Jama-Software

## Developing

After cloning the repo run `npm install` to install the app's dependencies.

If it doesn't already exist in your environment, create a new `.env` file in
the project root directory, copying `.env.example` and modifying as necessary
for the environment. (**Change the `SESSION_SECRET`!**)

Implement features and corresponding unit tests.

Lint and run all tests using `npm test`.

To simply lint your code, use `npm run lint`.

Then, to run and debug the app use `npm run debug`.

## Testing

### Unit testing using Mocha and Chai

To use Mocha, write your testing scripts in the test folder and then run the
specific script (if mocha is installed globally) using `mocha script.js` or
`mocha script`. (Or `./node_modules/.bin/mocha script.js` or
`./node_modules/.bin/mocha script` using your local installation of mocha)

Alternatively, lint and run all the tests using `npm test`.

## Copyright and license

Code and documentation copyright 2016 Iman Bilal, Michael Hansen, Ruben Piatnitsky, Chance Snow,
Kathleen Tran, Ricky Valencia, Marcus Week. Code and documentation is released under the MIT license.
