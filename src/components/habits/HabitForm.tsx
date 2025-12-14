import { useState, FormEvent } from 'react';
import { HabitCategory, HabitType, type Habit } from '../../types/habit';
import { useHabitStore } from '../../store/habitStore';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../../constants/habits';
import Button from '../common/Button';
import Modal from '../common/Modal';
import toast from 'react-hot-toast';

interface HabitFormProps {
  isOpen: boolean;
  onClose: () => void;
  habit?: Habit;
}

const EMOJI_SUGGESTIONS = [
  '✅', '🎯', '💪', '🏃', '📚', '✍️', '🧘', '💧', '🥗', '🌟',
  '🔥', '⭐', '📝', '🎨', '🎵', '📞', '💻', '🌱', '🏋️', '🧠',
];

export default function HabitForm({ isOpen, onClose, habit }: HabitFormProps) {
  const [name, setName] = useState(habit?.name || '');
  const [description, setDescription] = useState(habit?.description || '');
  const [icon, setIcon] = useState(habit?.icon || '✅');
  const [color, setColor] = useState(habit?.color || '#6366F1');
  const [category, setCategory] = useState<HabitCategory>(
    habit?.category || HabitCategory.CUSTOM
  );
  const [habitType, setHabitType] = useState<HabitType>(
    habit?.type || HabitType.CHECKBOX
  );
  const [reminderTime, setReminderTime] = useState(habit?.reminderTime || '');
  const [reminderEnabled, setReminderEnabled] = useState(
    habit?.reminderEnabled || false
  );

  // Numeric habit fields
  const [unit, setUnit] = useState(habit?.unit || '');
  const [targetValue, setTargetValue] = useState<number | string>(habit?.targetValue ?? '');
  const [minValue, setMinValue] = useState<number | string>(habit?.minValue ?? '');
  const [maxValue, setMaxValue] = useState<number | string>(habit?.maxValue ?? '');

  const addHabit = useHabitStore((state) => state.addHabit);
  const updateHabit = useHabitStore((state) => state.updateHabit);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter a habit name');
      return;
    }

    if (habitType === HabitType.NUMERIC && !unit.trim()) {
      toast.error('Please enter a unit for your numeric habit');
      return;
    }

    const habitData = {
      name: name.trim(),
      description: description.trim(),
      icon,
      color,
      category,
      type: habitType,
      reminderTime: reminderEnabled ? reminderTime : undefined,
      reminderEnabled,
      archived: false,
      // Numeric habit fields
      unit: habitType === HabitType.NUMERIC ? unit.trim() : undefined,
      targetValue: habitType === HabitType.NUMERIC && targetValue !== '' ? Number(targetValue) : undefined,
      minValue: habitType === HabitType.NUMERIC && minValue !== '' ? Number(minValue) : undefined,
      maxValue: habitType === HabitType.NUMERIC && maxValue !== '' ? Number(maxValue) : undefined,
    };

    if (habit) {
      updateHabit(habit.id, habitData);
      toast.success('Habit updated successfully!');
    } else {
      addHabit(habitData);
      toast.success('Habit created successfully!');
    }

    onClose();
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setIcon('✅');
    setColor('#6366F1');
    setCategory(HabitCategory.CUSTOM);
    setHabitType(HabitType.CHECKBOX);
    setReminderTime('');
    setReminderEnabled(false);
    setUnit('');
    setTargetValue('');
    setMinValue('');
    setMaxValue('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={habit ? 'Edit Habit' : 'Create Custom Habit'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Habit Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Morning Meditation"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Icon and Color */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Icon
            </label>
            <div className="flex flex-wrap gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
              {EMOJI_SUGGESTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`text-2xl p-2 rounded transition-colors ${
                    icon === emoji
                      ? 'bg-primary-100 dark:bg-primary-900'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Color
            </label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-12 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as HabitCategory)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {Object.values(HabitCategory).map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
        </div>

        {/* Habit Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tracking Type
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value={HabitType.CHECKBOX}
                checked={habitType === HabitType.CHECKBOX}
                onChange={(e) => setHabitType(e.target.value as HabitType)}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Checkbox (Yes/No)
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value={HabitType.NUMERIC}
                checked={habitType === HabitType.NUMERIC}
                onChange={(e) => setHabitType(e.target.value as HabitType)}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Numeric (Track a number)
              </span>
            </label>
          </div>
        </div>

        {/* Numeric Habit Fields */}
        {habitType === HabitType.NUMERIC && (
          <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Unit *
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g., glasses, hours, pages, rating"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Min Value
                </label>
                <input
                  type="number"
                  value={minValue}
                  onChange={(e) => setMinValue(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target
                </label>
                <input
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  placeholder="Optional"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Value
                </label>
                <input
                  type="number"
                  value={maxValue}
                  onChange={(e) => setMaxValue(e.target.value)}
                  placeholder="Optional"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Set min/max values to control the input range. Target is optional and for reference.
            </p>
          </div>
        )}

        {/* Reminder */}
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={reminderEnabled}
              onChange={(e) => setReminderEnabled(e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable daily reminder
            </span>
          </label>

          {reminderEnabled && (
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button type="submit" variant="primary" className="flex-1">
            {habit ? 'Update Habit' : 'Create Habit'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
