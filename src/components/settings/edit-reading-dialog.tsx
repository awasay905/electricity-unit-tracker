'use client';

import * as React from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import type { Reading } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  value: z.preprocess((val) => Number(val), z.number().min(0, 'Reading must be non-negative.')),
  date: z.string().nonempty('Date is required.'),
});

type FormValues = z.infer<typeof formSchema>;

interface EditReadingDialogProps {
  reading: Reading;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (readingId: string, updates: FormValues) => void;
}

export function EditReadingDialog({ reading, isOpen, onOpenChange, onSave }: EditReadingDialogProps) {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: reading.value,
      date: new Date(reading.date).toISOString().split('T')[0],
    },
  });
  
  // Reset form when the reading prop changes
  React.useEffect(() => {
    form.reset({
        value: reading.value,
        date: new Date(reading.date).toISOString().split('T')[0]
    });
  }, [reading, form]);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const updatedData = {
        ...data,
        date: new Date(data.date).toISOString()
    }
    onSave(reading.id, updatedData);
    toast({
      title: 'Reading Updated',
      description: 'The reading has been successfully saved.',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Reading</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meter Reading (kWh)</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Reading</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
