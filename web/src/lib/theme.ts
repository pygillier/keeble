import { createTheme, type MantineColorsTuple } from '@mantine/core';

const forest: MantineColorsTuple = [
  '#EAF5EE', // 0 - Mist (lightest)
  '#C9E8D5',
  '#A3D6B8',
  '#74C094',
  '#4BAA72',
  '#3D9970', // 5 - Leaf (accent)
  '#2B6E4E', // 6 - Forest (primary)
  '#225940',
  '#1A4532',
  '#123024', // 9 - darkest
];

const amber: MantineColorsTuple = [
  '#FDF4EE',
  '#F9E4D1',
  '#F4CCA9',
  '#EDB07B',
  '#E59460',
  '#D97B4F', // 5 - Amber (CTA)
  '#C06438',
  '#A0512C',
  '#7F3E21',
  '#5E2C16',
];

const rust: MantineColorsTuple = [
  '#FDECEA',
  '#F9CAC6',
  '#F0968E',
  '#E56358',
  '#D14239',
  '#C0392B', // 5 - Rust (danger)
  '#A02E23',
  '#80241B',
  '#601A13',
  '#40110C',
];

const slate: MantineColorsTuple = [
  '#ECF0F1',
  '#D5DBDD',
  '#B2BEC3',
  '#8FA0A8',
  '#6C838D',
  '#4A6275',
  '#3D5368',
  '#2C3E50', // 7 - Slate (text primary)
  '#1F2E3A',
  '#121D24',
];

export const keebleTheme = createTheme({
  primaryColor: 'forest',
  colors: { forest, amber, rust, slate },
  fontFamily: 'DM Sans, sans-serif',
  fontFamilyMonospace: 'monospace',
  headings: {
    fontFamily: 'Lora, serif',
    fontWeight: '500',
  },
  defaultRadius: 'md',
  other: {
    // Named tokens for direct use in components
    colorForest: '#2B6E4E',
    colorLeaf: '#3D9970',
    colorMist: '#EAF5EE',
    colorParchment: '#F7F5F0',
    colorAmber: '#D97B4F',
    colorRust: '#C0392B',
    colorSlate: '#2C3E50',
    colorStone: '#95A5A6',
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
  },
});
