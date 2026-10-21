import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { EvidenceBadge } from './EvidenceBadge';

describe('EvidenceBadge Component', () => {
  it('renders OBSERVED badge with citation notice', () => {
    const html = renderToString(
      <EvidenceBadge
        level="OBSERVED"
        citationSource="UAS Dharwad Research Station"
      />
    );
    expect(html).toContain('OBSERVED TRIAL');
    expect(html).toContain('UAS Dharwad Research Station');
  });

  it('renders MODEL-PREDICTED badge with confidence intervals', () => {
    const html = renderToString(
      <EvidenceBadge
        level="MODEL-PREDICTED"
        confidenceInterval={{ low: 1.15, high: 1.38, level: 0.95 }}
      />
    );
    expect(html).toContain('MODEL-PREDICTED');
    expect(html).toContain('95% CI:');
    expect(html).toContain('1.15');
    expect(html).toContain('1.38');
  });

  it('renders UNSUPPORTED badge with physiological competition notice', () => {
    const html = renderToString(
      <EvidenceBadge
        level="UNSUPPORTED"
      />
    );
    expect(html).toContain('UNSUPPORTED');
    expect(html).toContain('Physiological competition / rule violation');
  });
});
