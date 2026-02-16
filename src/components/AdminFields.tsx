import { PageConfig, FormField } from '@/types/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, ListChecks, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props {
  config: PageConfig;
  onUpdate: (updates: Partial<PageConfig>) => void;
}

interface SortableFieldProps {
  field: FormField;
  index: number;
  updateField: (index: number, updates: Partial<FormField>) => void;
  removeField: (index: number) => void;
}

const SortableField = ({ field, index, updateField, removeField }: SortableFieldProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="rounded-lg border border-border/50 p-4 space-y-3 bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button type="button" className="cursor-grab touch-none text-muted-foreground hover:text-foreground" {...attributes} {...listeners}>
            <GripVertical className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium text-foreground">{field.label}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Ativo</Label>
            <Switch checked={field.enabled} onCheckedChange={v => updateField(index, { enabled: v })} />
          </div>
          <Button variant="ghost" size="icon" onClick={() => removeField(index)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-xs">Label</Label>
          <Input value={field.label} onChange={e => updateField(index, { label: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Placeholder</Label>
          <Input value={field.placeholder} onChange={e => updateField(index, { placeholder: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Tipo</Label>
          <Select value={field.type} onValueChange={v => updateField(index, { type: v as FormField['type'] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Texto</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="number">Número</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end gap-2 pb-1">
          <Switch checked={field.required} onCheckedChange={v => updateField(index, { required: v })} />
          <Label className="text-xs">Obrigatório</Label>
        </div>
      </div>
    </div>
  );
};

const AdminFields = ({ config, onUpdate }: Props) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const updateField = (index: number, updates: Partial<FormField>) => {
    const fields = [...config.fields];
    fields[index] = { ...fields[index], ...updates };
    onUpdate({ fields });
  };

  const addField = () => {
    const id = 'field_' + Date.now();
    onUpdate({
      fields: [
        ...config.fields,
        { id, label: 'Novo Campo', placeholder: '', type: 'text', required: false, enabled: true },
      ],
    });
  };

  const removeField = (index: number) => {
    onUpdate({ fields: config.fields.filter((_, i) => i !== index) });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = config.fields.findIndex(f => f.id === active.id);
      const newIndex = config.fields.findIndex(f => f.id === over.id);
      onUpdate({ fields: arrayMove(config.fields, oldIndex, newIndex) });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-primary" /> Campos do Formulário
        </CardTitle>
        <Button size="sm" onClick={addField}>
          <Plus className="mr-1 h-4 w-4" /> Adicionar
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={config.fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
            {config.fields.map((field, i) => (
              <SortableField key={field.id} field={field} index={i} updateField={updateField} removeField={removeField} />
            ))}
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
};

export default AdminFields;
