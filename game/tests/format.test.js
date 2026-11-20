'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const format = require('../src/format.js');

test('금액: 억과 만을 분리하고 천 단위를 구분한다', () => {
  assert.equal(format(70_000_000, 'money'), '7,000만');
  assert.equal(format(100_000_000, 'money'), '1억');
  assert.equal(format(110_000_000, 'money'), '1억 1,000만');
  assert.equal(format(250_000_000, 'money'), '2억 5,000만');
});

test('금액: 만원 미만도 원 단위까지 보존하고 정확한 억 경계를 표시한다', () => {
  assert.equal(format(1, 'money'), '0.0001만');
  assert.equal(format(5_505_000, 'money'), '550.5만');
  assert.equal(format(99_999_999, 'money'), '9,999.9999만');
  assert.equal(format(100_000_001, 'money'), '1억 0.0001만');
});

test('금액: 음수 부호는 한 번만 쓰고 0도 만 단위로 표시한다', () => {
  assert.equal(format(-110_000_000, 'money'), '−1억 1,000만');
  assert.equal(format(-1, 'money'), '−0.0001만');
  assert.equal(format(0, 'money'), '0만');
  assert.equal(format(-0, 'money'), '0만');
});

test('주차와 기간: 주차 N주차, 소요 기간 N주', () => {
  assert.equal(format(1, 'week'), '1주차');
  assert.equal(format(12, 'week'), '12주차');
  assert.equal(format(0, 'duration'), '0주');
  assert.equal(format(3, 'duration'), '3주');
});

test('확률은 0~100 숫자를 정수 %로, 일반 숫자와 변화량은 부호 규칙에 맞게 표시한다', () => {
  assert.equal(format(0, 'percent'), '0%');
  assert.equal(format(72.5, 'percent'), '73%');
  assert.equal(format(100, 'percent'), '100%');
  assert.equal(format(1200), '1,200');
  assert.equal(format(2, 'delta'), '+2');
  assert.equal(format(-2, 'delta'), '−2');
  assert.equal(format(0, 'delta'), '0');
});
