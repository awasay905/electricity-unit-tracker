
'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { House } from '@/lib/types';
import { Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';

const formSchema = z.object({
  monthlyGoal: z.preprocess((val) => Number(val), z.number().min(1, 'Goal must be positive.')),
  billingDate: z.string().nonempty('Billing date is required.'),
  billingUnits: z.preprocess((val) => Number(val), z.number().min(0, 'Units cannot be negative.')),
});

type FormValues = z.infer<typeof formSchema>;

interface GoalFormProps {
  house: House;
  onUpdateHouse: (house: Partial<House>) => void;
}

export function GoalForm({ house, onUpdateHouse }: GoalFormProps) {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlyGoal: house.monthlyGoal,
      billingDate: new Date(house.billingCycleStart.date).toISOString().split('T')[0],
      billingUnits: house.billingCycleStart.units,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    onUpdateHouse({
        monthlyGoal: data.monthlyGoal,
        billingCycleStart: {
            date: new Date(data.billingDate).toISOString(),
            units: data.billingUnits
        }
    });
    toast({
        title: "Settings Updated",
        description: "Your house goal and billing cycle have been saved.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Target className="h-6 w-6" />
          Set Goals & Billing
        </CardTitle>
        <CardDescription>Only house owners can modify these settings.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <FormField
              control={form.control}
              name="monthlyGoal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Goal (kWh)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 300" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billingDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Billing Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billingUnits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Units at Billing</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 12345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" className="w-full">Update Settings</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Updating these settings will reset your current billing cycle and recalculate your usage from the new date and unit value. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={form.handleSubmit(onSubmit)}>
                    Confirm & Update
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
