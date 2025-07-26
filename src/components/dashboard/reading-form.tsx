'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Reading } from '@/lib/types';
import { Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReadingFormProps {
  lastReadingValue: number;
  onAddReading: (reading: Omit<Reading, 'id' | 'isBillingCycleStart'>) => void;
}

export function ReadingForm({ lastReadingValue, onAddReading }: ReadingFormProps) {
  const { toast } = useToast();
  
  const formSchema = z.object({
    value: z.preprocess(
      (val) => Number(val),
      z.number().gt(lastReadingValue, {
        message: `Reading must be greater than the last reading of ${lastReadingValue}.`,
      })
    ),
    date: z.string().nonempty('Date is required.'),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: '' as any, // Changed from undefined to empty string
      date: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const newReading = {
      value: data.value,
      date: new Date(data.date).toISOString(),
    };
    onAddReading(newReading);
    toast({
        title: "Reading Submitted!",
        description: `Successfully added reading of ${data.value} kWh.`,
    })
    form.reset({ value: '' as any, date: new Date().toISOString().split('T')[0] }); // Changed from undefined to empty string
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Zap className="h-6 w-6" />
          Add New Reading
        </CardTitle>
        <CardDescription>Enter the latest reading from your electric meter.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meter Reading (kWh)</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" placeholder={`> ${lastReadingValue}`} {...field} />
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
            <Button type="submit" className="w-full">Submit Reading</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
