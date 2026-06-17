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
    defaultGeoInc: props.Variant({
      name: 'Country of Incorporation',
      defaultValue: 'India',
      options: ['India', 'United States', 'Singapore', 'United Kingdom'],
      group: 'Calculator Defaults',
    }),
    defaultGeoOp: props.Variant({
      name: 'Country of Operation',
      defaultValue: 'India',
      options: ['India', 'United States', 'Singapore', 'United Kingdom'],
      group: 'Calculator Defaults',
    }),
    defaultStage: props.Variant({
      name: 'Current Stage',
      defaultValue: 'Series A/B',
      options: ['Pre-seed', 'Seed', 'Series A/B', 'Series B/C', 'Series C+'],
      group: 'Calculator Defaults',
    }),
    defaultLegalEntity: props.Text({
      name: 'Legal Entity Name',
      defaultValue: '',
      group: 'Calculator Defaults',
    }),
    defaultShareholders: props.Number({
      name: 'Shareholders Count',
      defaultValue: 30,
      group: 'Calculator Defaults',
    }),
    defaultOptionHolders: props.Number({
      name: 'Option Holders Count',
      defaultValue: 15,
      group: 'Calculator Defaults',
    }),
    defaultNewHireGrants: props.Number({
      name: 'New Hire Grants/yr',
      defaultValue: 5,
      group: 'Calculator Defaults',
    }),
    defaultRefreshGrants: props.Number({
      name: 'Refresh Grants/yr',
      defaultValue: 5,
      group: 'Calculator Defaults',
    }),
    defaultFundraise: props.Boolean({
      name: 'Planning to Fundraise?',
      defaultValue: false,
      group: 'Calculator Defaults',
    }),
    defaultFundraiseRound: props.Variant({
      name: 'Fundraise Round',
      defaultValue: 'Seed',
      options: ['Pre-seed', 'Seed', 'Series A/B', 'Series B/C', 'Series C+'],
      group: 'Calculator Defaults',
    }),
    defaultNewShareholdersFromFundraise: props.Number({
      name: 'New Shareholders from Fundraise',
      defaultValue: 0,
      group: 'Calculator Defaults',
    }),
    defaultValuation: props.Boolean({
      name: 'Need Valuation Reports?',
      defaultValue: false,
      group: 'Calculator Defaults',
    }),
    defaultValFreq: props.Variant({
      name: 'Valuation Frequency',
      defaultValue: 'Annually',
      options: ['Annually', 'Quarterly'],
      group: 'Calculator Defaults',
    }),
    defaultValType: props.Variant({
      name: 'Valuation Type',
      defaultValue: '409A',
      options: ['409A', 'Black-Scholes', 'Reddy Valuation (RV)', 'Market Benchmark (MB)', 'HMRC'],
      group: 'Calculator Defaults',
    }),
    defaultAdminMethod: props.Variant({
      name: 'Administrative Method',
      defaultValue: 'In-house (Spreadsheets)',
      options: ['In-house (Spreadsheets)', 'Outsourced (CA/Law Firm)'],
      group: 'Calculator Defaults',
    }),
  },
  options: {
    ssr: false,
    applyTagSelectors: false,
  },
})
