'use client';

import React, { useState } from 'react';
import { SurfaceProvider } from '@/lib/surface/SurfaceContext';
import {
  Button,
  Card,
  MetricCard,
  InsightCard,
  DownloadCard,
  Checkbox,
  Radio,
  Toggle,
  StepIndicator,
  Tag,
  Badge,
  Callout,
  SourceStamp,
} from '@/components/primitives';

function PrimitivesDemoGroup({ title }: { title: string }) {
  const [checkboxChecked, setCheckboxChecked] = useState(true);
  const [radioChecked, setRadioChecked] = useState(true);
  const [toggleChecked, setToggleChecked] = useState(true);

  return (
    <div className="space-y-6">
      <div className="border-b pb-2 font-mono text-xs uppercase tracking-widest font-semibold opacity-70">
        {title}
      </div>

      {/* Buttons */}
      <div className="space-y-2">
        <h4 className="text-xs font-mono uppercase tracking-wider opacity-60">Buttons</h4>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Primary Action</Button>
          <Button variant="secondary">Secondary Action</Button>
          <Button variant="text-link">Text Link</Button>
        </div>
      </div>

      {/* Card & MetricCard */}
      <div className="space-y-2">
        <h4 className="text-xs font-mono uppercase tracking-wider opacity-60">Cards & Metrics</h4>
        <Card className="mb-3">
          <h5 className="font-semibold text-base mb-1">Standard Card Title</h5>
          <p className="text-sm opacity-80">This is a primitive card component reading styles from surface context.</p>
        </Card>
        <MetricCard
          label="Avg Starting Salary"
          value="£32,500"
          subtext="After completing Level 3 Qualification"
          sourceStamp={{
            sourceName: 'ONS ASHE 2025',
            sourceUrl: 'https://www.ons.gov.uk',
            verifiedAt: '2026-01-15',
            reviewDue: '2026-12-31',
          }}
        />
      </div>

      {/* InsightCard & DownloadCard */}
      <div className="space-y-2">
        <h4 className="text-xs font-mono uppercase tracking-wider opacity-60">Content & Downloads</h4>
        <InsightCard
          title="Understanding Lifelong Learning Entitlement (LLE)"
          category="Funding Guide"
          date="12 Feb 2026"
          excerpt="Comprehensive breakdown of the £38,140 lifetime tuition loan entitlement for UK adults."
        />
        <DownloadCard
          title="Pathway Syllabus & RQF Map"
          fileSize="1.4 MB"
          fileFormat="PDF"
        />
      </div>

      {/* Inputs (Checkbox, Radio, Toggle) */}
      <div className="space-y-2">
        <h4 className="text-xs font-mono uppercase tracking-wider opacity-60">Controls</h4>
        <div className="flex flex-wrap items-center gap-4">
          <Checkbox label="Employed status" checked={checkboxChecked} onChange={(e) => setCheckboxChecked(e.target.checked)} />
          <Radio label="Full-time route" checked={radioChecked} onChange={() => setRadioChecked(!radioChecked)} />
          <Toggle label="Notifications" checked={toggleChecked} onChange={setToggleChecked} />
        </div>
      </div>

      {/* StepIndicator */}
      <div className="space-y-2">
        <h4 className="text-xs font-mono uppercase tracking-wider opacity-60">Step Indicator</h4>
        <StepIndicator currentStep={2} totalSteps={4} steps={['Entry Check', 'Funding Applied', 'Training', 'Qualified']} />
      </div>

      {/* Tags & Badges */}
      <div className="space-y-2">
        <h4 className="text-xs font-mono uppercase tracking-wider opacity-60">Tags & Badges</h4>
        <div className="flex flex-wrap items-center gap-2">
          <Tag variant="default">Level 3</Tag>
          <Tag variant="cobalt">Fully Funded</Tag>
          <Tag variant="coral">Closing Soon</Tag>
          <Badge status="confirmed">Confirmed</Badge>
          <Badge status="inferred">Inferred</Badge>
          <Badge status="stale">Stale</Badge>
        </div>
      </div>

      {/* Callouts */}
      <div className="space-y-2">
        <h4 className="text-xs font-mono uppercase tracking-wider opacity-60">Callouts</h4>
        <Callout title="Important Requirement" variant="info">
          Applicants must hold Math and English Level 2 or GCSE grade C/4 prior to registration.
        </Callout>
        <Callout title="Review Required" variant="alert">
          Qualification details past verification date. Re-confirm with awarding body.
        </Callout>
      </div>

      {/* SourceStamps */}
      <div className="space-y-2">
        <h4 className="text-xs font-mono uppercase tracking-wider opacity-60">Source Stamps (Fresh vs Stale)</h4>
        <div className="flex flex-col space-y-2">
          <SourceStamp
            sourceName="Gov.uk Skills England"
            sourceUrl="https://gov.uk"
            verifiedAt="2026-02-01"
            reviewDue="2026-10-01"
          />
          <SourceStamp
            sourceName="Ofqual Register"
            sourceUrl="https://ofqual.gov.uk"
            verifiedAt="2024-01-01"
            reviewDue="2025-01-01"
          />
        </div>
      </div>
    </div>
  );
}

export default function TokenTestPage() {
  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Design Tokens & Primitives Test</h1>
          <p className="text-graphite font-sans">
            Visual inspection of primitives rendered in both surface registers side-by-side.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Consumer Surface Column */}
          <div className="border border-silver rounded-2xl overflow-hidden shadow-lg">
            <SurfaceProvider surface="consumer">
              <div className="p-6 md:p-8 space-y-6 min-h-full">
                <PrimitivesDemoGroup title="Consumer Surface (Ivory Dominant)" />
              </div>
            </SurfaceProvider>
          </div>

          {/* Partner Surface Column */}
          <div className="border border-graphite rounded-2xl overflow-hidden shadow-lg">
            <SurfaceProvider surface="partner">
              <div className="p-6 md:p-8 space-y-6 min-h-full">
                <PrimitivesDemoGroup title="Partner Surface (Charcoal Dominant)" />
              </div>
            </SurfaceProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
