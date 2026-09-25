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
    // Only uPVC can be set in the store now, so this is held at the pipeline,
    // which every configuration passes through, for when the range grows.
    const result = commit({ ...DEFAULT_DOOR, material: 'timber', dimensions: { width: 3000, height: 2400 } });
    expect(result.config.dimensions.width).toBe(3000);
    // Found by field rather than by index: relying on errors[0] broke the
    // moment another rule started reporting first.
    const width = result.validation.errors.find((e) => e.field === 'width');
    expect(width?.message).toContain('Timber');
    expect(width?.message).toMatch(/between .* and .*/);
  });

  it('will not set a material that is not offered', () => {
    const before = useConfigurator.getState().config;
    for (const material of ['aluminium', 'timber', 'composite'] as const) useConfigurator.getState().setMaterial(material);
    expect(useConfigurator.getState().config).toBe(before);
    expect(useConfigurator.getState().config.material).toBe('upvc');
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
    // Timber is outside the offered range, so a material error is expected and
    // is not what this test is about; nothing else may fail.
    expect(result.validation.errors.map((e) => e.field)).toEqual(['material']);
  });
});

describe('what an error blocks', () => {
  beforeEach(reset);

  it('keeps the product on screen when only the order is blocked', () => {
    // Regression: gating unsold materials made every aluminium link render the
    // DEFAULT product, silently discarding a shape, size and style that were
    // all perfectly drawable. An unsold material is not a geometry fault.
    const aluminium: DoorConfigState = {
      ...DEFAULT_DOOR,
      material: 'aluminium',
      dimensions: { width: 900, height: 2100 },
    };
    useConfigurator.setState({ config: aluminium, lastValid: DEFAULT_DOOR });
    useConfigurator.getState().setDimensions(900, 2100);

    const state = useConfigurator.getState();
    expect(state.validation.errors.some((e) => e.field === 'material')).toBe(true);
    expect(state.validation.errors.every((e) => e.blocks === 'order')).toBe(true);
    // The size the customer asked for is still what gets drawn.
    expect(state.lastValid.dimensions).toEqual({ width: 900, height: 2100 });
    expect(state.lastValid.material).toBe('aluminium');
  });

  it('falls back only when the render itself is blocked', () => {
    useConfigurator.getState().setDimensions(9000, 1981);
    const state = useConfigurator.getState();
    expect(state.validation.errors.some((e) => e.blocks === 'render')).toBe(true);
    expect(state.lastValid.dimensions.width).toBe(838);
  });

  it('declares what every error blocks', () => {
    // A new rule cannot be added without answering the question.
    const broken: DoorConfigState = {
      ...DEFAULT_DOOR,
      material: 'timber',
      dimensions: { width: 9000, height: 100 },
      trickleVents: { position: 'head-of-frame', count: 99 },
    };
    const errors = validateConfig(broken).errors;
    expect(errors.length).toBeGreaterThan(2);
    for (const error of errors) {
      expect(['render', 'order'], `${error.field}: ${error.message}`).toContain(error.blocks);
    }
  });
});
