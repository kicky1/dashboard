import React from 'react';

import type { OptionType } from '@/components/ui';
import { cleanup, render, screen } from '@/lib/test-utils';

import { Select } from './select';

afterEach(cleanup);

describe('Select component ', () => {
  const options: OptionType[] = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' },
  ];
  it('should render correctly ', () => {
    const onSelect = jest.fn();
    render(
      <Select
        label="Select options"
        options={options}
        onSelect={onSelect}
        testID="select"
      />
    );
    expect(screen.getByTestId('select-trigger')).toBeOnTheScreen();
    expect(screen.getByTestId('select-label')).toBeOnTheScreen();
  });

  it('should render the label correctly ', () => {
    const onSelect = jest.fn();
    render(
      <Select
        label="Select"
        options={options}
        onSelect={onSelect}
        testID="select"
      />
    );
    expect(screen.getByTestId('select-trigger')).toBeOnTheScreen();
    expect(screen.getByTestId('select-label')).toBeOnTheScreen();
    expect(screen.getByTestId('select-label')).toHaveTextContent('Select');
  });

  it('should render the error correctly ', () => {
    const onSelect = jest.fn();
    render(
      <Select
        label="Select"
        options={options}
        onSelect={onSelect}
        testID="select"
        error="Please select an option"
      />
    );
    expect(screen.getByTestId('select-trigger')).toBeOnTheScreen();
    expect(screen.getByTestId('select-error')).toBeOnTheScreen();
    expect(screen.getByTestId('select-error')).toHaveTextContent(
      'Please select an option'
    );
  });

  it('should render placeholder when no value is selected', () => {
    const onSelect = jest.fn();
    render(
      <Select
        label="Select"
        options={options}
        onSelect={onSelect}
        testID="select"
        placeholder="Select an option"
      />
    );
    expect(screen.getByTestId('select-trigger')).toBeOnTheScreen();
    expect(screen.getByText('Select an option')).toBeOnTheScreen();
  });

  it('should render selected value label when value is provided', () => {
    const onSelect = jest.fn();
    render(
      <Select
        label="Select"
        options={options}
        onSelect={onSelect}
        testID="select"
        value="chocolate"
        placeholder="Select an option"
      />
    );
    expect(screen.getByTestId('select-trigger')).toBeOnTheScreen();
    expect(screen.getByText('Chocolate')).toBeOnTheScreen();
  });

  it('should render disabled state correctly', () => {
    const onSelect = jest.fn();
    render(
      <Select
        label="Select"
        options={options}
        onSelect={onSelect}
        testID="select"
        disabled={true}
      />
    );
    const selectTrigger = screen.getByTestId('select-trigger');
    expect(selectTrigger).toBeOnTheScreen();
    expect(selectTrigger.props.accessibilityState.disabled).toBe(true);
  });

  it('should render focused state correctly', () => {
    const onSelect = jest.fn();
    render(
      <Select
        label="Select"
        options={options}
        onSelect={onSelect}
        testID="select"
      />
    );
    expect(screen.getByTestId('select-trigger')).toBeOnTheScreen();
    expect(screen.getByTestId('select-label')).toBeOnTheScreen();
  });
});
