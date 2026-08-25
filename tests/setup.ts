import '@testing-library/jest-dom/vitest';

class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// @ts-expect-error - test-environment polyfill
global.IntersectionObserver = IntersectionObserverStub;

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function () {};
}