import { beforeEach, describe, expect, it } from 'vitest';
import { commit, useConfigurator } from './store';
import { DEFAULT_DOOR, DEFAULT_WINDOW } from '../config/defaults';
import type { DoorConfigState } from '../config/types';
import { validateConfig } from '../config/validate';

const NO_BARS = { style: 'none' as const, columns: 1, rows: 1, barWidth: 0 };

function reset(): void {
  useConfigurator.setState({
    config: DEFAULT_DOOR,
    lastValid: DEFAULT_DOOR,
    notices: [],
    validation: validateConfig(DEFAULT_DOOR),
  });
}

describe('the commit pipeline', () => {
  beforeEach(reset);

  it('reconciles material on a live edit, not only on decode', () => {
    // Timber offers RAL6005; uPVC does not.
    const timber: DoorConfigState = {
      ...DEFAULT_DOOR,
      material: 'timber',
      colour: { external: { mode: 'ral', code: 'RAL6005' }, internal: { mode: 'match' } },
    };
    useConfigurator.setState({ config: timber, lastValid: timber });

    useConfigurator.getState().setMaterial('upvc');

    const state = useConfigurator.getState();
    expect(state.config.material).toBe('upvc');
    expect(state.config.colour.external).not.toEqual({ mode: 'ral', code: 'RAL6005' });
    expect(state.notices.some((n) => n.field === 'colour.external')).toBe(true);
    expect(state.validation.errors).toHaveLength(0);
  });

  it('enforces safety glazing when an edit makes a location critical', () => {
    useConfigurator.getState().edit((config) => ({
      ...config,
      dimensions: { width: 1450, height: 2100 },
      surround:
        config.productType === 'door'
          ? { ...config.surround, leftSideLight: { width: 400, bars: NO_BARS, safety: null } }
          : DEFAULT_DOOR.surround,
    }) as DoorConfigState);

    const state = useConfigurator.getState();
    expect(state.config.glazing.safety).toBe('toughened');
    // Raised, but never silently: the customer is told why.
    expect(state.notices.some((n) => n.message.includes('critical location'))).toBe(true);
    expect(state.validation.errors).toHaveLength(0);
  });

  it('keeps the last valid configuration on screen when a size cannot be made', () => {
    useConfigurator.getState().setDimensions(9000, 1981);

    const state = useConfigurator.getState();
    expect(state.validation.errors.length).toBeGreaterThan(0);
    // Step 3.4: an unmanufacturable size never renders.
    expect(state.lastValid.dimensions.width).toBe(838);
    expect(state.config.dimensions.width).toBe(9000);
  });

  it('reports an unmakeable size rather than quietly resizing it', () => {
    // A material change can invalidate a size that was legal a moment ago.
    // Reconciliation fixes colour and finish, but never the dimensions: the
    // customer chose those and is owed the reason, not a silent correction.
    useConfigurator.getState().setDimensions(3000, 2400);
    useConfigurator.getState().setMaterial('timber');

    const state = useConfigurator.getState();
    expect(state.config.dimensions.width).toBe(3000);
    expect(state.validation.errors.some((e) => e.message.includes('Timber'))).toBe(true);
    expect(state.validation.errors[0]?.message).toMatch(/between .* and .*/);
  });

  it('starts a fresh configuration when the product type changes', () => {
    useConfigurator.getState().setProductType('window');
    expect(useConfigurator.getState().config).toEqual(DEFAULT_WINDOW);
  });

  it('is the only route in: commit reconciles and enforces in one pass', () => {
    const unsafe: DoorConfigState = {
      ...DEFAULT_DOOR,
      material: 'timber',
      finish: { external: 'woodgrain-foil', internal: 'match' },
      dimensions: { width: 1450, height: 2100 },
      surround: { ...DEFAULT_DOOR.surround, leftSideLight: { width: 400, bars: NO_BARS, safety: null } },
    };
    const result = commit(unsafe);

    expect(result.config.finish.external).toBe('smooth');       // reconciled
    expect(result.config.glazing.safety).toBe('toughened');     // enforced
    expect(result.notices).toHaveLength(2);
    expect(result.validation.errors).toHaveLength(0);
  });
});
