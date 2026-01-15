// src/components/create/ImageEditor.tsx

interface ImageEditorProps {
  image: string;
  filter: string;
  onFilterChange: (filter: string) => void;
}

const FILTERS = [
  { name: 'Normal', value: 'none', filter: '' },
  { name: 'Clarendon', value: 'clarendon', filter: 'contrast(1.2) saturate(1.35)' },
  { name: 'Gingham', value: 'gingham', filter: 'brightness(1.05) hue-rotate(-10deg)' },
  { name: 'Moon', value: 'moon', filter: 'grayscale(1) contrast(1.1) brightness(1.1)' },
  { name: 'Lark', value: 'lark', filter: 'contrast(0.9) saturate(1.1)' },
  { name: 'Reyes', value: 'reyes', filter: 'sepia(0.22) brightness(1.1) contrast(0.85)' },
];

export default function ImageEditor({ image, filter, onFilterChange }: ImageEditorProps) {
  const selectedFilter = FILTERS.find(f => f.value === filter);

  return (
    <div className="flex h-full">
      {/* Image Preview */}
      <div className="flex-1 flex items-center justify-center bg-black">
        <img
          src={image}
          alt="Preview"
          className="max-h-full max-w-full object-contain"
          style={{ filter: selectedFilter?.filter || '' }}
        />
      </div>

      {/* Filters Sidebar */}
      <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="p-4">
          <h3 className="font-semibold mb-4">Filters</h3>
          
          <div className="grid grid-cols-3 gap-3">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => onFilterChange(f.value)}
                className="group"
              >
                <div
                  className={`relative aspect-square rounded-lg overflow-hidden mb-2 ${
                    filter === f.value ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <img
                    src={image}
                    alt={f.name}
                    className="w-full h-full object-cover"
                    style={{ filter: f.filter }}
                  />
                </div>
                <p className="text-xs text-gray-600 group-hover:text-gray-900">
                  {f.name}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}