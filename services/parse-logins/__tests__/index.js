import parseLogins from '../parse-logins';

const stubsPositiveMixed = {
  stub: 'login @login2 login3 @lo-gin lo1-gin2',
  result: ['login', 'login2', 'login3', 'lo-gin', 'lo1-gin2']
};

const stubsPositiveAt = {
  stub: '@login @login2 @login3 lo-gin lo1-gin2',
  result: ['login', 'login2', 'login3']
};

const stubNegative = '@1 :+1: @1login @;123,, логин -login';

describe('services/parse-logins', () => {
  it('should match mixed logins', () => {
    assert.deepEqual(parseLogins(stubsPositiveMixed.stub), stubsPositiveMixed.result);
  });

  it('should match only logins with @', () => {
    assert.deepEqual(parseLogins(stubsPositiveAt.stub, null, true), stubsPositiveAt.result);
  });

  it('should not match anything', () => {
    assert.deepEqual(parseLogins(stubNegative), []);
  });

  it('should return empty array if not a string passed', () => {
    assert.deepEqual(parseLogins(), []);
  });

  it('should use start from index if it`s already an number', () => {
    assert.deepEqual(parseLogins(stubsPositiveMixed.stub, 5), stubsPositiveMixed.result.slice(1));
  });

  it('should use start from index if it`s a string', () => {
    assert.deepEqual(parseLogins(stubsPositiveMixed.stub, '@login2'), stubsPositiveMixed.result.slice(2));
  });

  it('should use start from index if it`s an array', () => {
    assert.deepEqual(parseLogins(stubsPositiveMixed.stub, ['login3', 'lo1-gin2']), stubsPositiveMixed.result.slice(3));
  });

  it('should stop on new line break', () => {
    assert.deepEqual(parseLogins('/add @login \n @login2'), ['login']);
  });

  it('should correct find start from for strings like +@login', () => {
    assert.deepEqual(parseLogins('+@login', ['/add', '+']), ['login']);
  });
});
