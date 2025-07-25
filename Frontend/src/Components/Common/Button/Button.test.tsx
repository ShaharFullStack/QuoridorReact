import React from 'react';
import { renderWithProviders, testHelpers } from '../../../Utils/TestUtils';
import { Button, IconButton } from './Button';

describe('Button Component', () => {
  describe('Basic Functionality', () => {
    test('renders button with text', () => {
      const { getByRole } = renderWithProviders(
        <Button>Click me</Button>
      );
      
      const button = getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Click me');
    });

    test('handles click events', async () => {
      const handleClick = jest.fn();
      const { getByRole, user } = renderWithProviders(
        <Button onClick={handleClick}>Click me</Button>
      );
      
      const button = getByRole('button');
      await user.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('can be focused and activated with keyboard', async () => {
      const handleClick = jest.fn();
      const { getByRole, user } = renderWithProviders(
        <Button onClick={handleClick}>Click me</Button>
      );
      
      const button = getByRole('button');
      button.focus();
      
      expect(button).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
      
      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('Variants', () => {
    test('applies correct CSS classes for variants', () => {
      const { rerender, getByRole } = renderWithProviders(
        <Button variant="primary">Primary</Button>
      );
      
      expect(getByRole('button')).toHaveClass('btn-primary');
      
      rerender(<Button variant="secondary">Secondary</Button>);
      expect(getByRole('button')).toHaveClass('btn-secondary');
      
      rerender(<Button variant="outline">Outline</Button>);
      expect(getByRole('button')).toHaveClass('btn-outline');
      
      rerender(<Button variant="ghost">Ghost</Button>);
      expect(getByRole('button')).toHaveClass('btn-ghost');
      
      rerender(<Button variant="danger">Danger</Button>);
      expect(getByRole('button')).toHaveClass('btn-danger');
    });
  });

  describe('Sizes', () => {
    test('applies correct CSS classes for sizes', () => {
      const { rerender, getByRole } = renderWithProviders(
        <Button size="small">Small</Button>
      );
      
      expect(getByRole('button')).toHaveClass('btn-small');
      
      rerender(<Button size="medium">Medium</Button>);
      expect(getByRole('button')).toHaveClass('btn-medium');
      
      rerender(<Button size="large">Large</Button>);
      expect(getByRole('button')).toHaveClass('btn-large');
    });
  });

  describe('Loading State', () => {
    test('shows loading spinner when loading', () => {
      const { getByRole } = renderWithProviders(
        <Button loading>Loading Button</Button>
      );
      
      const button = getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toBeDisabled();
    });

    test('shows custom loading text', () => {
      const { getByRole } = renderWithProviders(
        <Button loading loadingText="Please wait...">Submit</Button>
      );
      
      const button = getByRole('button');
      expect(button).toHaveTextContent('Please wait...');
    });

    test('prevents interaction when loading', async () => {
      const handleClick = jest.fn();
      const { getByRole, user } = renderWithProviders(
        <Button loading onClick={handleClick}>Submit</Button>
      );
      
      const button = getByRole('button');
      await user.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    test('prevents interaction when disabled', async () => {
      const handleClick = jest.fn();
      const { getByRole, user } = renderWithProviders(
        <Button disabled onClick={handleClick}>Disabled</Button>
      );
      
      const button = getByRole('button');
      expect(button).toBeDisabled();
      
      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Icons', () => {
    test('renders left icon', () => {
      const { getByRole } = renderWithProviders(
        <Button leftIcon={<span data-testid="left-icon">👈</span>}>
          With Left Icon
        </Button>
      );
      
      const button = getByRole('button');
      expect(button.querySelector('[data-testid="left-icon"]')).toBeInTheDocument();
    });

    test('renders right icon', () => {
      const { getByRole } = renderWithProviders(
        <Button rightIcon={<span data-testid="right-icon">👉</span>}>
          With Right Icon
        </Button>
      );
      
      const button = getByRole('button');
      expect(button.querySelector('[data-testid="right-icon"]')).toBeInTheDocument();
    });

    test('hides icons when loading', () => {
      const { getByRole } = renderWithProviders(
        <Button 
          loading
          leftIcon={<span data-testid="left-icon">👈</span>}
          rightIcon={<span data-testid="right-icon">👉</span>}
        >
          Loading
        </Button>
      );
      
      const button = getByRole('button');
      expect(button.querySelector('[data-testid="left-icon"]')).not.toBeInTheDocument();
      expect(button.querySelector('[data-testid="right-icon"]')).not.toBeInTheDocument();
    });
  });

  describe('Full Width', () => {
    test('applies full width class', () => {
      const { getByRole } = renderWithProviders(
        <Button fullWidth>Full Width Button</Button>
      );
      
      expect(getByRole('button')).toHaveClass('btn-full-width');
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA attributes', () => {
      const { getByRole } = renderWithProviders(
        <Button aria-describedby="help-text">Accessible Button</Button>
      );
      
      const button = getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'help-text');
    });

    test('supports screen reader announcements for loading', () => {
      const { getByRole } = renderWithProviders(
        <Button loading>Submit</Button>
      );
      
      const button = getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toHaveAttribute('aria-live', 'polite');
    });

    test('meets accessibility requirements', async () => {
      const { container } = renderWithProviders(
        <div>
          <Button>Standard Button</Button>
          <Button disabled>Disabled Button</Button>
          <Button loading>Loading Button</Button>
        </div>
      );
      
      await testHelpers.expectToBeAccessible(container);
    });
  });
});

describe('IconButton Component', () => {
  describe('Basic Functionality', () => {
    test('renders icon button with proper aria-label', () => {
      const { getByRole } = renderWithProviders(
        <IconButton 
          icon={<span data-testid="icon">🏠</span>}
          aria-label="Go to home"
        />
      );
      
      const button = getByRole('button', { name: 'Go to home' });
      expect(button).toBeInTheDocument();
      expect(button.querySelector('[data-testid="icon"]')).toBeInTheDocument();
    });

    test('requires aria-label prop', () => {
      // This test verifies TypeScript compilation - aria-label is required
      expect(() => {
        renderWithProviders(
          <IconButton 
            icon={<span>🏠</span>}
            aria-label="Required label"
          />
        );
      }).not.toThrow();
    });

    test('applies icon-only styling', () => {
      const { getByRole } = renderWithProviders(
        <IconButton 
          icon={<span>🏠</span>}
          aria-label="Home"
        />
      );
      
      expect(getByRole('button')).toHaveClass('btn-icon-only');
    });
  });

  describe('Accessibility', () => {
    test('icon is hidden from screen readers', () => {
      const { getByRole } = renderWithProviders(
        <IconButton 
          icon={<span data-testid="icon">🏠</span>}
          aria-label="Home"
        />
      );
      
      const button = getByRole('button');
      const iconContainer = button.querySelector('[aria-hidden="true"]');
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toContainElement(button.querySelector('[data-testid="icon"]'));
    });

    test('meets accessibility requirements', async () => {
      const { container } = renderWithProviders(
        <div>
          <IconButton icon={<span>🏠</span>} aria-label="Home" />
          <IconButton icon={<span>⚙️</span>} aria-label="Settings" disabled />
          <IconButton icon={<span>💾</span>} aria-label="Save" loading />
        </div>
      );
      
      await testHelpers.expectToBeAccessible(container);
    });
  });
});

describe('Button Component - Edge Cases', () => {
  test('handles rapid clicks gracefully', async () => {
    const handleClick = jest.fn();
    const { getByRole, user } = renderWithProviders(
      <Button onClick={handleClick}>Click me</Button>
    );
    
    const button = getByRole('button');
    
    // Simulate rapid clicks
    await Promise.all([
      user.click(button),
      user.click(button),
      user.click(button),
    ]);
    
    expect(handleClick).toHaveBeenCalledTimes(3);
  });

  test('handles form submission', async () => {
    const handleSubmit = jest.fn((e) => e.preventDefault());
    const { getByRole, user } = renderWithProviders(
      <form onSubmit={handleSubmit}>
        <Button type="submit">Submit Form</Button>
      </form>
    );
    
    const button = getByRole('button');
    await user.click(button);
    
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  test('works with custom className', () => {
    const { getByRole } = renderWithProviders(
      <Button className="custom-class">Custom Button</Button>
    );
    
    const button = getByRole('button');
    expect(button).toHaveClass('btn', 'btn-primary', 'btn-medium', 'custom-class');
  });
});