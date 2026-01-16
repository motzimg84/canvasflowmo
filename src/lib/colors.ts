// PROJECT: CanvasFlow Pro
// MODULE: Color Palette for Projects

export const projectColors = [
  { name: 'Coral', value: '#FF6B6B' },
  { name: 'Orange', value: '#FF9F43' },
  { name: 'Gold', value: '#FFC107' },
  { name: 'Lime', value: '#A8E6CF' },
  { name: 'Teal', value: '#20C997' },
  { name: 'Cyan', value: '#17A2B8' },
  { name: 'Blue', value: '#4A90D9' },
  { name: 'Indigo', value: '#6C5CE7' },
  { name: 'Purple', value: '#A855F7' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Rose', value: '#F472B6' },
  { name: 'Slate', value: '#64748B' },
];

export const getAvailableColors = (usedColors: string[]) => {
  return projectColors.filter(color => !usedColors.includes(color.value));
};

export const getRandomAvailableColor = (usedColors: string[]): string | null => {
  const available = getAvailableColors(usedColors);
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)].value;
};
