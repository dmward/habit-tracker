import { useState } from 'react';
import { Plus, Hash } from 'lucide-react';
import { HABIT_TEMPLATES, CATEGORY_LABELS } from '../../constants/habits';
import { HabitCategory, HabitType, type HabitTemplate } from '../../types/habit';
import { useHabitStore } from '../../store/habitStore';
import Card from '../common/Card';
import Modal from '../common/Modal';
import toast from 'react-hot-toast';

interface HabitSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HabitSelector({ isOpen, onClose }: HabitSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | 'all'>('all');
  const addHabit = useHabitStore((state) => state.addHabit);

  const filteredTemplates =
    selectedCategory === 'all'
      ? HABIT_TEMPLATES
      : HABIT_TEMPLATES.filter((t) => t.category === selectedCategory);

  const handleSelectTemplate = (template: HabitTemplate) => {
    addHabit({
      name: template.name,
      description: template.description,
      icon: template.icon,
      color: template.suggestedColor,
      category: template.category,
      type: template.type || HabitType.CHECKBOX,
      reminderEnabled: false,
      archived: false,
      // Numeric habit fields
      unit: template.unit,
      targetValue: template.targetValue,
      minValue: template.minValue,
      maxValue: template.maxValue,
    });
    toast.success(`Added "${template.name}" to your habits!`);
    onClose();
  };

  const categories: Array<HabitCategory | 'all'> = [
    'all',
    ...Object.values(HabitCategory),
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add a Habit" size="xl">
      <div className="space-y-4">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {category === 'all' ? 'All' : CATEGORY_LABELS[category]}
            </button>
          ))}
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {filteredTemplates.map((template) => (
            <Card
              key={template.name}
              hover
              onClick={() => handleSelectTemplate(template)}
              className="p-4"
            >
              <div className="flex items-start gap-3">
                <div
                  className="text-3xl flex-shrink-0"
                  style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
                >
                  {template.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {template.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span
                      className="inline-block px-2 py-1 text-xs rounded-full"
                      style={{
                        backgroundColor: `${template.suggestedColor}20`,
                        color: template.suggestedColor,
                      }}
                    >
                      {CATEGORY_LABELS[template.category]}
                    </span>
                    {template.type === HabitType.NUMERIC && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        <Hash className="w-3 h-3" />
                        {template.targetValue ? `Target: ${template.targetValue} ${template.unit}` : 'Numeric'}
                      </span>
                    )}
                  </div>
                </div>
                <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No habits found in this category
          </div>
        )}
      </div>
    </Modal>
  );
}
