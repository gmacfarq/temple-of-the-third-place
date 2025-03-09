export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

export const formatSacramentType = (type: string): string => {
  const typeMap: Record<string, string> = {
    'chocolate': 'Chocolate',
    'dried_fruit': 'Dried Fruit',
    'capsule': 'Capsule',
    'gummy': 'Gummy',
    'psily_tart': 'Psily Tart',
    'tincture': 'Tincture',
    'other': 'Other'
  };

  return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
};