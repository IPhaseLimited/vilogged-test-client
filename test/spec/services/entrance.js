'use strict';

describe('Service: entrance', function () {

  // load the service's module
  beforeEach(module('viLoggedClientApp'));

  // instantiate service
  var entrance;
  beforeEach(inject(function (_entrance_) {
    entrance = _entrance_;
  }));

  it('should do something', function () {
    expect(!!entrance).toBe(true);
  });

});
