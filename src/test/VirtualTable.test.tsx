import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VirtualTable } from '../components/table/VirtualTable';

describe('VirtualTable Component', () => {
  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      value: 600,
    });
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      value: 600,
    });
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      value: 1200,
    });
  });

  it('renders empty state when data is empty', () => {
    render(<VirtualTable data={[]} />);
    expect(screen.getByText(/No JSON Data Loaded/i)).toBeTruthy();
  });

  it('renders table toolbar, columns, and rows when data is provided', () => {
    const data = [
      { id: 101, title: 'Item Alpha', price: 29.99 },
      { id: 102, title: 'Item Beta', price: 49.99 },
    ];
    render(<VirtualTable data={data} />);
    expect(screen.getByText(/Total Items:/i)).toBeTruthy();
    expect(screen.getByText('Columns')).toBeTruthy();
    expect(screen.getByText('Move Columns')).toBeTruthy();
    expect(screen.getByText('Export')).toBeTruthy();
    expect(screen.getByText('Item Alpha')).toBeTruthy();
    expect(screen.getByText('Item Beta')).toBeTruthy();
  });
});
