import { declareComponent } from '@webflow/react'
import { props } from '@webflow/data-types'
import ROICalculator from './ROICalculator'
import './ROICalculator.css'

export default declareComponent(ROICalculator, {
  name: 'ROI Calculator',
  description:
    'EquityList equity administration ROI calculator — compare in-house vs EquityList costs.',
  group: 'Interactive',
  props: {
    showHero: props.Boolean({
      name: 'Show Hero Section',
      defaultValue: true,
      group: 'Hero',
    }),
    heroBadgeText: props.Text({
      name: 'Badge Text',
      defaultValue: 'ROI Calculator · v2.4',
      group: 'Hero',
    }),
    heroTitlePre: props.Text({
      name: 'Title (before highlight)',
      defaultValue: 'How much is managing equity on',
      group: 'Hero',
    }),
    heroTitleHighlight: props.Text({
      name: 'Title Highlighted Word',
      defaultValue: 'spreadsheets',
      group: 'Hero',
      tooltip: 'Rendered in italic purple with an underline highlight.',
    }),
    heroTitlePost: props.Text({
      name: 'Title (after highlight)',
      defaultValue: 'costing you?',
      group: 'Hero',
    }),
    heroSubtitle: props.Text({
      name: 'Subtitle',
      defaultValue:
        'Based on industry benchmarks and real company data — see precisely how much time and capital is wasted on manual administration.',
      group: 'Hero',
    }),
    ctaText: props.Text({
      name: 'CTA Button Text',
      defaultValue: 'Book a demo',
      group: 'Call to Action',
    }),
    ctaUrl: props.Text({
      name: 'CTA Button URL',
      defaultValue: 'https://www.equitylist.co/contact',
      group: 'Call to Action',
      tooltip: 'Opens in a new tab when clicked.',
    }),
  },
  options: {
    ssr: false,
    applyTagSelectors: false,
  },
})
